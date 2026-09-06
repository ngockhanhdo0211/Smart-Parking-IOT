const stateService = require('../services/state.service');

const hasExactKeys = (value, keys) => {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && keys.sort().every((key, index) => key === actual[index]);
};

function validateSensorPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Body must be a JSON object.';
  if (!hasExactKeys(body, ['parking', 'gas', 'vibration'])) return 'Body must contain only parking, gas and vibration.';
  if (!body.parking || typeof body.parking !== 'object' || Array.isArray(body.parking)) return 'parking must be an object.';
  if (!Object.keys(body.parking).length) return 'parking must contain at least one slot.';
  if (!Object.keys(body.parking).every((id) => /^[a-z][a-z0-9_-]{0,19}$/i.test(id))) return 'Parking slot IDs are invalid.';
  if (!Object.values(body.parking).every((value) => typeof value === 'boolean')) return 'Every parking value must be boolean.';
  if (!Number.isFinite(body.gas) || body.gas < 0 || body.gas > 10000) return 'gas must be a number from 0 to 10000.';
  if (typeof body.vibration !== 'boolean') return 'vibration must be boolean.';
  return null;
}

function getState(req, res) {
  res.json(stateService.getState());
}

function updateSystem(req, res, next) {
  try {
    const validationError = validateSensorPayload(req.body);
    if (validationError) return res.status(400).json({ success: false, error: validationError });
    stateService.updateFromDevice(req.body);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getState, updateSystem, validateSensorPayload };
