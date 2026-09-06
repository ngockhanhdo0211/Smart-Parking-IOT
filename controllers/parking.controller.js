const stateService = require('../services/state.service');

function getParking(req, res) {
  res.json(stateService.getState().parking);
}

module.exports = { getParking };
