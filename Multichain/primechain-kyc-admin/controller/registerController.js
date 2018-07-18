const userModel = require('../model/user');
const notificationEngine = require('../sendgrid/notification_grid');
const common_utility = require('../lib/common_utility');

module.exports = {
    get_register_page: (req, res, next) => {
        res.render('register');
    },

    post_register: (req, res, next) => {
        try {
            req.checkBody('username', 'username is required').notEmpty();
            req.checkBody('email', 'Email is required').notEmpty();
            req.checkBody('email', 'Email isn\'t valid').isEmail();
            req.checkBody('designation', 'Designation is required').notEmpty();
            req.checkBody('organisation', 'Designation is required').notEmpty();
            req.checkBody('cell', 'Mobie Number is required').notEmpty();

            var errors = req.validationErrors();

            if (errors) {
                res.render('register', {
                    errors: errors
                });
            }
            else {
                var username = req.body.username;
                var email = req.body.email;
                var designation = req.body.designation;
                var organisation = req.body.organisation;
                var cell = req.body.cell;
                var random = common_utility.generateRandomString(40);

                var newUser = new userModel({
                    username: username,
                    email: email.toLowerCase().trim(),
                    designation: designation,
                    organisation: organisation,
                    cell: cell,
                    random: random,
                    checked: "n"

                });

                userModel.find((err, user_is_created) => {
                    if (err) { return next(err); }

                    if (user_is_created.length == 0) {
                        userModel.getUserDetailsByEmail(email, (err, user_details) => {
                            if (err) { return next(err) };

                            if (user_details == null) {
                                userModel.createNewUser(newUser, (err, is_created) => {
                                    if (err) { return next(err); }

                                    if (is_created) {
                                        notificationEngine.sendActivationEmail(email, username, designation, organisation, random, (err, email_success) => {
                                            if (err) { return next(err); }

                                            if (email_success) {
                                                req.flash('success_msg', 'Account activation mail has been sent to your email.');
                                                res.redirect('/');
                                            }
                                            else {
                                                req.flash('error_msg', 'Unable to sent account activation mail.');
                                                res.redirect('/register');
                                            }
                                        });
                                    }
                                    else {
                                        req.flash('error_msg', 'Unable to create an user, please try after sometime.');
                                        res.redirect('/register');
                                    }

                                });
                            }
                            else {
                                req.flash('error_msg', 'An user with this email address already exists.');
                                res.redirect('/register');
                            }
                        });
                    }
                    else {
                        req.flash('error_msg', 'Admin was already created.');
                        res.redirect('/register');
                    }
                });
            }
        } catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/register');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/register');
            }
        }
    }
}