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
    if (!gateStatuses.includes(body.gateStatus)) return res.status(400).json({ success: false, error: 'Invalid gateStatus.' });
    stateService.updateDemo(body);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = { updateDemo };
