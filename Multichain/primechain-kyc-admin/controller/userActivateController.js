const userModel = require('../model/user');
const notificationEngine = require('../sendgrid/notification_grid');
const common_utility = require('../lib/common_utility');

module.exports = {
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
                                // It will verifies user with is email that user exists?, if yes it will update the password.
                                userModel.verifyUser(email, secret, random, (err, is_verified) => {
                                    if (err) { return next(err); }

                                    if (is_verified) {
                                        // sending email notification to the user of his login credentials
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