const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const stateService = require('./services/state.service');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.get('/tokens.css', (req, res) => res.sendFile(path.join(__dirname, 'tokens.css')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/system', require('./routes/system.routes'));
app.use('/api/gate', require('./routes/gate.routes'));
app.use('/api/parking', require('./routes/parking.routes'));
app.use('/api/sensors', require('./routes/sensor.routes'));

io.on('connection', (socket) => socket.emit('system:update', stateService.getState()));
stateService.stateEvents.on('change', (nextState) => io.emit('system:update', nextState));

app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'API endpoint not found.' }));
app.use((req, res) => res.status(404).type('text').send('Page not found.'));
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'JSON body is too large.' });
  }
  console.error(error);
  return res.status(500).json({ success: false, error: 'Internal server error.' });
});

const watchdog = setInterval(() => stateService.checkEsp32Online(), 3000);
watchdog.unref();

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Parking server running at http://localhost:${PORT}`);
  });
}

module.exports = { app, server, io };
