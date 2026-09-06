const stateService = require('../services/state.service');

function getSensors(req, res) {
  res.json(stateService.getState().sensors);
}

module.exports = { getSensors };
