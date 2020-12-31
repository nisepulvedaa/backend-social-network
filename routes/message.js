'use strinc'

var express = require('express');
var MessageController = require('../controllers/message');
var router = express.Router();
var md_auth = require('../middlewares/authenticate');


router.get('/pruebas-message', md_auth.ensureAuth, MessageController.probando);
router.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
router.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmittedMessages);
router.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getUnviewedMessages);
router.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages);
router.post('/message', md_auth.ensureAuth, MessageController.saveMessage);

module.exports = router;