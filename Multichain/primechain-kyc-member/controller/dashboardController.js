const loginModel = require("../model/login");
const whiteListModel = require('../model/whitelist');
const formModel = require('../model/form');
const notificationEngine = require('../sendgrid/notification_grid');

module.exports = {

    get_dashbaord_page: (req, res, next) => {
        try {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ip_arr = ip.split(':');
            ip = ip_arr[ip_arr.length - 1];

            let browser = req.headers["user-agent"];

            let newLogin = new loginModel({
                email: req.user.email,
                ip: ip,
                browser: browser
            });

            loginModel.recordLoginInDB(newLogin, (err, is_logged) => {
                if (err) { return next(err); }

                notificationEngine.sendLoginNotification(req.user.username, req.user.email, ip, browser, (err, email_sent) => {
                    if (err) { return next(err); }

                    // Querying the liststreamitems api to retrive all the member records and display in view page.
                    formModel.find((err, members_uploaded) => {
                        if (err) { return next(err); }

                        // Checks if the result is true and its length.
                        if (members_uploaded) {
                            let records = (members_uploaded) ? members_uploaded.length : 0;

                            whiteListModel.find((err, whitelisted_members) => {
                                if (err) { return next(err); }

                                let members_count = (whitelisted_members) ? whitelisted_members.length : 0;

                                loginModel.getloginDetailsByEmail(req.user.email, (err, loginDetails) => {
                                    if (err) { return next(err); }

                                    if (loginDetails != null) {
                                        res.render('dashboard', { loginDetails: loginDetails, records: records, members: members_count });
                                    }
                                    else {
                                        res.render('dashboard', { records: records, members: members_count });
                                    }
                                });
                            });
                        }
                        else {
                            // If the result is null it will render the view members view page
                            res.render('dashboard');
                        }
                    });
                });
            });
        }
        catch (e) {
            res.render('dashboard');
        }
    }
}