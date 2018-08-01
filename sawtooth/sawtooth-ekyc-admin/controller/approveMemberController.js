const async = require('async');
const dataStorage = require('../BlockchainLib/storage');
const common_utility = require('../lib/common_utility');
const notificationConfig = require("../configs/notification_config");

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://'+ notificationConfig.MONGO_IP_ADDRESS + ':' + notificationConfig.MONGO_PORT + '/';
let memberUser = []; 

module.exports = {
    get_approve_member_page: (req, res, next) => {
        try {

            MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
                if (err) throw err;
                var dbo = db.db("primechainkycmember");
                dbo.collection("users").find({}).toArray(function(err, result) {
                  if (err) throw err;
                  memberUser = result;
                  module.exports.get_data_from_database(req, res, memberUser);
                  db.close();
                });
            });
        } catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/user/approve_member');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/user/approve_member');
            }
        }
    },

    post_approve_a_member: (req, res, next) => {
        try {
            MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                if (err) throw err;
                var dbo = db.db("primechainkycmember");
                var myquery = { email: req.body.member_email };
                var newvalues = { $set: {status: "active" } };
                dbo.collection("users").updateOne(myquery, newvalues, function(err, result) {
                if (err) throw err;
                if (result) {
                    req.flash("success_msg", "Status updated");
                    res.redirect('/user/approve_member');
                }
                else {
                    req.flash("error_msg", "Unable to update status");
                    res.redirect('/user/approve_member');
                }
                  db.close();
                });
            });
        }
        catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/user/approve_member');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/user/approve_member');
            }
        }
    },

    get_data_from_database: function(req, res, memberUser) {
        var has_to_approve = [];
            if (memberUser && memberUser.length) {
                async.forEach(memberUser, (key, callback) => {
                    if (key) {
                            if (key["status"] === "pending") {
                                has_to_approve.push({ "name": key["username"], "email": key["email"], "cin": key["member_cin"] });

                                callback();
                            }
                            else {
                                callback();
                            }
                    }
                    else {
                        callback();
                    }
                }, (err) => {
                    if (err) { return next(err); }

                    res.render("approve_member", { "member_records": has_to_approve });
                });
            } 
            else {
                res.render("approve_member", { "error_msg": "Unable to fetch records from database" });
        }
    }
}