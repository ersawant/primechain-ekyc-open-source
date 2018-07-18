const userModel = require('../model/user');
module.exports = {

    get_change_password_page: (req, res, next) => {
        res.render('change_password');
    },

    post_change_password: (req, res, next) => {
        try {
            var old_password = req.body.old_password;
            var new_password_1 = req.body.new_password_1;
            var new_password_2 = req.body.new_password_2;

            if (new_password_1 != new_password_2) {
                req.flash("error_msg", "Password doesn't match");
                res.redirect('/user/change_password');
            }
            else {
                userModel.verifyPassword(req.user.email, old_password, (err, isMatch) => {
                    if (err) { return next(err); }

                    if (isMatch) {
                        userModel.updateUserPassword(req.user.email, new_password_1, (err, callback) => {
                            if (err) { return next(err); }

                            if (callback) {
                                req.flash("success_msg", "Password updated successfully.");
                                res.redirect('/');
                            }
                            else {
                                req.flash("error_msg", "Error occured while updating password.");
                                res.redirect('/user/change_password');
                            }
                        });
                    }
                    else {
                        req.flash("error_msg", "Old password is incorrect.");
                        res.redirect('/user/change_password');
                    }
                });
            }
        } catch (error) {
            req.flash("error_msg", "Error occured while updating password, please after sometime.");
            res.redirect('/user/change_password');
        }
    }
}