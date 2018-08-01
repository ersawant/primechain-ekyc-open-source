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
            req.checkBody('member_name', 'Organisation name is required').notEmpty();
            req.checkBody('member_cin', 'Member cin is required').notEmpty();
            req.checkBody('member_website_address', 'Member Website Address is required').notEmpty();
            req.checkBody('member_api_url', 'Member API URL is required').notEmpty();
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
                var organisation = req.body.member_name;
                var member_cin = req.body.member_cin;
                var member_website_address = req.body.member_website_address;
                var member_api_url = req.body.member_api_url;
                var cell = req.body.cell;
                var random = common_utility.generateRandomString(40);

                var newUser = new userModel({
                    username: username,
                    email: email.toLowerCase().trim(),
                    designation: designation,
                    organisation: organisation,
                    member_cin: member_cin,
                    member_website_address: member_website_address,
                    member_api_url: member_api_url,
                    cell: cell,
                    random: random,
                    checked: "n",
                    status: "pending"
                });

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
    },

    get_user_activate: (req, res, next) => {
        try {
            // checks the query string with parameters is passed with or not?
            if (Object.keys(req.query).length === 0) {
                // flash is used to display flash messages in the view page
                req.flash("error_msg", "Invalid parameters passed.");
                res.redirect('/');
            }
            else {
                let email = req.query.user_email;
                let random = req.query.random;

                // Validate user with this email and random is exist or not
                userModel.doesUserExists(email, random, (err, user_exists) => {
                    if (err) { return next(err); }

                    if (user_exists) {
                        userModel.getUserDetailsByEmail(email, (err, user_details) => {
                            if (err) { return next(err); }

                            if (user_details.checked === 'n') {
                                // Generating password for the user by calling a function from common utility file.
                                let secret = common_utility.generateRandomString(12);
                                let count = 0;
                                // It will verifies user with is email that user exists?, if yes it will update the password.
                                userModel.verifyUser(email, secret, random, (err, is_verified) => {
                                    if (err) { return next(err); }
                                    count+=1;
                                    if (is_verified) {
                                        // sending email notification to the user of his login credentials
                                        if(count === 1) {
                                            notificationEngine.sendLoginCredentials(email, user_details.username, secret, (err, email_sent) => {
                                                if (err) { return next(err); }
                                                if (email_sent) {
                                                    // flash is used to display flash message in the view page. 
                                                    req.flash("success_msg", "Login credentials has been sent to your email.");
                                                    res.redirect('/');
                                                }
                                                else {
                                                    // flash is used to display flash message in the view page.
                                                    req.flash("error_msg", "Unable to sent login credentials.");
                                                    res.redirect('/');
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        // flash is used to display flash message in the view page.
                                        req.flash("error_msg", "Internal server error while updating records.");
                                        res.redirect('/');
                                    }
                                });
                            }
                            else {
                                // flash is used to display flash message in the view page.
                                req.flash("error_msg", "Invalid parameters passed.");
                                res.redirect('/');
                            }
                        });
                    }
                    else {
                        // flash is used to display flash message in the view page.
                        req.flash("error_msg", "Unable to fetch user details from database.");
                        res.redirect('/');
                    }
                });
            }
        }
        catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/');
            }
        }
    }
}