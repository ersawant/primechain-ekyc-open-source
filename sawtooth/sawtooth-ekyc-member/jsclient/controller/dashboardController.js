const loginModel = require("../model/login");
const formModel = require('../model/form');
const notificationEngine = require('../sendgrid/notification_grid');

module.exports = {

    get_dashboard_page: (req, res, next) => {
        try {
            loginModel.getloginDetails((err, loginDetails) => {
                if (err) throw err;
                if (loginDetails != null) {
                    // Render the dashboard view page with parameters
                    res.render('dashboard', { loginDetails: loginDetails });
                }
                else {
                    // Render the dashboard view page.
                    res.render('dashboard');
                }
            });
        }
        catch (e) {
            res.render('dashboard');
        }
    }
}