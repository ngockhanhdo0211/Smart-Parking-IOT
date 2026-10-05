const stateService = require('../services/state.service');
const { validateSensorPayload } = require('./system.controller');

function updateDemo(req, res, next) {
  try {
    const body = req.body || {};
    const sensorPayload = { parking: body.parking, gas: body.gas, vibration: body.vibration };
    const validationError = validateSensorPayload(sensorPayload);
    if (validationError) return res.status(400).json({ success: false, error: validationError });
    if (typeof body.esp32Online !== 'boolean') return res.status(400).json({ success: false, error: 'esp32Online must be boolean.' });
    const gateStatuses = ['open', 'closed', 'opening', 'closing'];
    const entryStatus = body.gateInStatus || body.gateStatus;
    if (!gateStatuses.includes(entryStatus)) return res.status(400).json({ success: false, error: 'Invalid gateInStatus.' });
    if (body.gateOutStatus !== undefined && !gateStatuses.includes(body.gateOutStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid gateOutStatus.' });
    }
    stateService.updateDemo(body);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = { updateDemo };
