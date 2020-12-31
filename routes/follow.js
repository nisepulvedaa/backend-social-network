'use strinc'

var express = require('express');
var FollowController = require('../controllers/follow');
var router = express.Router();
var md_auth = require('../middlewares/authenticate');

router.get('/pruebas-follow', md_auth.ensureAuth, FollowController.prueba);
router.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
router.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
router.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
router.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUser);
router.get('/get-my-follow', md_auth.ensureAuth, FollowController.getMyFollows);
router.get('/get-my-follow-back', md_auth.ensureAuth, FollowController.getFollowBack);

module.exports = router;