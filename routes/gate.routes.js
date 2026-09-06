const router = require('express').Router();
const controller = require('../controllers/gate.controller');

router.post('/open', controller.openGate);
router.post('/close', controller.closeGate);
router.get('/command', controller.getCommand);
router.post('/status', controller.updateStatus);

module.exports = router;
