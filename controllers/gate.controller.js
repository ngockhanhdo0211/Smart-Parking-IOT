const stateService = require('../services/state.service');
const VALID_STATUSES = new Set(['open', 'closed', 'opening', 'closing']);

function openGate(req, res) {
  stateService.setGateCommand('open');
  res.json({ success: true, command: 'open' });
}

function closeGate(req, res) {
  stateService.setGateCommand('close');
  res.json({ success: true, command: 'close' });
}

function getCommand(req, res) {
  res.json({ command: stateService.getState().gate.command });
}

function updateStatus(req, res) {
  const { status } = req.body || {};
  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({ success: false, error: 'status must be open, closed, opening or closing.' });
  }
  stateService.updateHeartbeat();
  stateService.updateGateStatus(status);
  return res.json({ success: true, status });
}

module.exports = { openGate, closeGate, getCommand, updateStatus };
