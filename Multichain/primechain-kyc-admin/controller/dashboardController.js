const loginModel = require("../model/login");
const dataStorage = require("../BlockchainLib/storage");
const async = require("async");
const config = require("../configs/blockchain_config");
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
                    dataStorage.listStreamKeys(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], (err, result) => {
                        if (err) { return next(err); }
                        // Checks if the result is true and its length.
                        if (result) {
                            let members = [];
                            // We are iterating each result with async function call.
                            async.forEach(result, function (item, callback) {
                                // Querying to blockchain to get data fo the members.
                                dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], item["key"], (err, data) => {
                                    if (err) { return callback(err, null); }

                                    if (data["status"] === "active") {

                                        members.push({ name: data["member_name"] });

                                        callback();
                                    }
                                    else {
                                        callback();
                                    }
                                });
                                // This function will handle the callback of async.
                            }, (err) => {
                                if (err) { return next(err); }

                                let members_count = (members) ? members.length : 0;
                                
                                dataStorage.listStreamItems(config["STREAMS"]["KYC_DATA_STREAM"], (err, items) => {
                                    if (err) { return next(err); }

                                    let records = (items) ? items.length : 0;

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
