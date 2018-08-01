const loginModel = require("../model/login");
const dataStorage = require("../BlockchainLib/storage");
const async = require("async");
const notificationEngine = require('../sendgrid/notification_grid');
const notificationConfig = require("../configs/notification_config");

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://' + notificationConfig.MONGO_IP_ADDRESS + ':' + notificationConfig.MONGO_PORT + '/';
let memberUser = []; 

module.exports = {
    get_dashbaord_page: (req, res, next) => {
        try {

            MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
                if (err) throw err;
                var dbo = db.db("primechainkycmember");
                dbo.collection("users").find({}).toArray(function(err, result) {
                  if (err) throw err;
                  memberUser = result;
                  db.close();
                });
            });
            
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
                       
                        // Checks if the result is true and its length.
                        if (memberUser && memberUser.length) {
                            var members = [];
                            // We are iterating each result with async function call.
                            async.forEach(memberUser, function (item, callback) {
                                // Querying to blockchain to get data fo the members.
                                if (item["status"] === "active") {
                                    members.push({ name: item["member_name"] });
                                    callback();
                                }
                                else {
                                    callback();
                                }
                                // This function will handle the callback of async.
                            }, (err) => {
                                if (err) { return next(err); }

                                let members_count = members.length;
                                    if (err) { return next(err); }

                                    let records = memberUser.length;

                                    loginModel.getloginDetailsByEmail(req.user.emails, (err, loginDetails) => {
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
        }
        catch (e) {
            res.render('dashboard');
        }
    }
}