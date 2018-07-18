const userModel = require('../model/user');
const common_utility = require('../lib/common_utility');
const notificationEngine = require('../sendgrid/notification_grid');

module.exports = {
    get_forget_password_page: (req, res, next) => {
        res.render('forget_password');
    },

    post_forget_password: (req, res, next) => {
        try {
            // Checks email is not empty and it is correct
            req.checkBody("user_email", "Email is required").notEmpty();
            req.checkBody("user_email", "Email isn't valid").isEmail();

            let errors = req.validationErrors();
            // If form has error, redirect to the forget password page with an error message.
            if (errors) {
                res.render('forget_password', {
                    errors: errors
                });
            }
            else {
                let email = req.body.user_email;
                // check whether user email exist or not?
                userModel.getUserDetailsByEmail(email, (err, user_details) => {
                    if (err) { return next(err); }

                    if (user_details) {
                        // generating a random by using a function from common utility file.
                        let random = common_utility.generateRandomString(40);
                        // Updating the random number in the database for verification 
                        userModel.updateRandom(email, random, (err, is_updated) => {
                            if (err) { return next(err); }

                            if (is_updated) {
                                let username = user_details.username;
                                // Reset password link email will be send to the user.
                                notificationEngine.sendPasswordResetEmail(email, username, random, (err, email_sent) => {
                                    if (err) { return next(err); }

                                    if (email_sent) {
                                        // flash is used to display flash message in the view page.
                                        req.flash("success_msg", "Reset password link has sent to your mail.")
                                        res.redirect('/');
                                    }
                                    else {
                                        // flash is used to display flash message in the view page.
                                        req.flash("error_msg", "Unable to sent reset password link email. Please try after sometime.");
                                        res.redirect('/');
                                    }
                                });
                            }
                            else {
                                // flash is used to display flash message in the view page.
                                req.flash("error_msg", "Error occured while updating in database.");
                                res.redirect('/');
                            }
                        });
                    }
                    else {
                        // flash is used to display flash message in the view page.
                        req.flash("error_msg", "User Email not exist");
                        res.redirect('/');
                    }
                });
            }
        } catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/');
            }
        }
    },

    get_reset_password_page: (req, res, next) => {
        try {
            // checks the query string with parameters is passed with or not?
            if (Object.keys(req.query).length === 0) {
                // flash is used to display flash message in the view page.
                req.flash("error_msg", "Invalid parameters passed.");
                res.redirect('/');
            }
            else {
                let email = req.query.user_email;
                let random = req.query.random;
                // checks wheather the user exists or not by passung email and random.
                userModel.doesUserExists(email, random, (err, is_user) => {
                    if (err) { return next(err); }

                    if (is_user) {
                        res.render('reset_password', { email: email, random: random });
                    }
                    else {
                        // flash is used to display flash message in the view page.
                        req.flash("error_msg", "Invalid parameters passed.");
                        res.redirect('/');
                    }
                });
            }
        } catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/');
            }
        }
    },

    post_reset_password: (req, res, next) => {
        try {
            let email = req.body.user_email;
            let random = req.body.random;
            let user_password = req.body.user_password;
            // checks wheather user exists or not by passing email and random.
            userModel.doesUserExists(email, random, (err, user_exist) => {
                if (err) { return next(err); }

                if (user_exist) {
                    // Generate a random by calling the function from common utility.
                    let random = common_utility.generateRandomString(40);
                    // Update new password to the database.
                    userModel.updateResetPassword(email, user_password, random, (err, updated) => {
                        if (err) { return next(err); }
                        
                        if (updated) {
                            // flash is used to display flash message in the view page.
                            req.flash("success_msg", "Your password has been successfully reset.");
                            res.redirect('/');
                        }
                        else {
                            // flash is used to display flash message in the view page.
                            req.flash("error_msg", "An error occured while updating the database, try after sometime");
                            res.redirect('/');
                        }
                    });
                }
                else {
                    // flash is used to display flash message in the view page.
                    req.flash("error_msg", "Unable to fetch user details, try after sometime.");
                    res.redirect('/');
                }
            });
        } catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/');
            }
            if (error instanceof TypeError) {
                req.flash('error_msg', TypeError.prototype.name);
                res.redirect('/');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/');
            }
        }
    }
}