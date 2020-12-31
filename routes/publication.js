'use strinc'

var express = require('express');
var PublicationController = require('../controllers/publication');
var router = express.Router();
var md_auth = require('../middlewares/authenticate');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/publications' });


router.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
router.get('/pruebas-publication', md_auth.ensureAuth, PublicationController.probando);
router.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication);
router.get('/get-image-pub/:imageFile', PublicationController.getImageFile);
router.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
router.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
router.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
module.exports = router;