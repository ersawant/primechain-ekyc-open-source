const dataStorage = require("../BlockchainLib/storage");
const userModel = require('../model/user');

module.exports = {
    get_verify_an_user: (req, res, next) => {
        try { 
            userModel.getUserByUserAddress(req.user.user_address, (err, user) => {
                // if any error occured while retrieving the record it will send the request to else part.
                if (err) { return next(err); }
                // If the details of the users is fetched from the blockchain, the user will redirected to two step authentication page.
                else if (user) {
                    if (user["status"] === "active") {
                        res.redirect('/user/dashboard');
                    }
                    else {
                        req.flash('error_msg', "Your account is not approved by admin. Please email to info@primechain.in");
                        res.redirect('/');
                    }
                }
                else {
                    req.flash('error_msg', "Error occured while fetching records from blockchain.");
                    res.redirect('/');
                }
            });
        }
        catch (error) {
            req.flash('error_msg', "Internal server error occured.");
            res.redirect('/');
        }
    }
}