// Importing libraries/files
const router = require('express').Router();
const passport = require("passport");

const loginController = require('../controller/loginController');
const registerController = require('../controller/registerController');
const resetPasswordController = require('../controller/resetPasswordController');
const userActivateController = require('../controller/userActivateController');

router.get('/', loginController.get_login_page);

router.post('/login', passport.authenticate("local", { successRedirect: '/user/dashboard', failureRedirect: '/', failureFlash: true }), loginController.post_login);

router.get('/register', registerController.get_register_page);

router.post('/register', registerController.post_register);

router.get('/user_activate', userActivateController.get_user_activate);

router.get('/forget_password', resetPasswordController.get_forget_password_page);

router.post('/forget_password', resetPasswordController.post_forget_password);

router.get('/reset_password', resetPasswordController.get_reset_password_page);

router.post('/reset_password', resetPasswordController.post_reset_password);

module.exports = router;