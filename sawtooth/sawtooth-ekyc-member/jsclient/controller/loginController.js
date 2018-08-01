const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const userModel = require("../model/user");

module.exports = {
    get_login_page: (req, res, next) => {
        res.render('login');
    },

    post_login: (req, res, next) => {
        res.render('/');
    }
}

passport.use(new localStrategy((username, password, done) => {
    try {
        // Retrieve the user details from the private database.
        userModel.getUserDetailsByEmail(username, (err, user_details) => {
            if (err) { return done(null, false, { message: err }); }

            if (!user_details) {
                return done(null, false, { message: 'unknown user' });
            }
            // retrieve the user password from the private database.
            userModel.comparePassword(password, user_details.password, (err, isMatch) => {
                if (err) {
                    return done(null, false, { message: err });
                }
                else if (isMatch) {
                    return done(null, user_details);
                }
                else {
                    return done(null, false, { message: "Password is incorrect." });
                }
            });
        });
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
}));

// In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser((email, done) => {
    userModel.getUserDetailsByEmail(email, (err, user_details) => {
        if (err) { return done(err, null); }
        else { done(null, user_details); }
    });
});