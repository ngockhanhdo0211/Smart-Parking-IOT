const router = require('express').Router();
const controller = require('../controllers/system.controller');
const demoController = require('../controllers/demo.controller');

router.get('/state', controller.getState);
router.post('/update', controller.updateSystem);
router.post('/demo', demoController.updateDemo);

module.exports = router;
