const router = require('express').Router();
const controller = require('../controllers/parking.controller');
router.get('/', controller.getParking);
module.exports = router;
