'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var router = express.Router();
var md_auth = require('../middlewares/authenticate');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

router.get('/', UserController.home);
router.get('/pruebas-user', md_auth.ensureAuth, UserController.pruebas);
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
router.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
router.get('/get-image-user/:imageFile', UserController.getImageFile);
router.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);
router.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
router.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
module.exports = router;