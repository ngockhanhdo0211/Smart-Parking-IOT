const router = require('express').Router();
const controller = require('../controllers/sensor.controller');
router.get('/', controller.getSensors);
module.exports = router;
