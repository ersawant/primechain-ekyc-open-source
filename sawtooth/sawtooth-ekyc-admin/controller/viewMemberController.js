const dataStorage = require("../BlockchainLib/storage");
const async = require("async");
const notificationConfig = require("../configs/notification_config");

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://' + notificationConfig.MONGO_IP_ADDRESS + ':' + notificationConfig.MONGO_PORT + '/';
let memberUser = []; 

module.exports = {
    get_view_members_page: (req, res, next) => {
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
        }
        catch (error) {
            req.flash("error_msg", "Internal server error occured");
            res.redirect("/user/view_members");
        }
    },
    
    get_data_from_database: function(req, res, memberUser) {
        // Checks if the result is true and its length.
        if (memberUser && memberUser.length) {
            let members = [];
            // We are iterating each result with async function call.
            async.forEach(memberUser, function (item, callback) {
                // Querying to blockchain to get data fo the members.
                    if (item["status"] === "active") {
                        members.push({ name: item["username"], email: item["email"], member_api_url: item["member_api_url"] });
                        callback();
                    }
                    else {
                        callback();
                    }
                // This function will handle the callback of async.
            },  (err) => {
                if (err) { return next(err); }
                res.render('view_members', { members: members });
            });
        }
        else {
            // If the result is null it will render the view members view page
            res.render('view_members');
        }
    }
}