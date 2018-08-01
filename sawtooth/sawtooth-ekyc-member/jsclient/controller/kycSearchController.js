const async = require('async');
const dataStorage = require('../BlockchainLib/storage');
const formModel = require('../model/form');
const userModel = require('../model/user');

module.exports = {
    
    get_search_record_page: (req, res, next) => {
        res.render('kyc_corporate_search_record');
    },

    post_search_record: (req, res, next) => {
        try {
            userModel.getUserDetailsByEmail(req.user.email, (err, userDetails) => {
                if(userDetails["status"] === "active") {
                    var cin = req.body.cin;
                    var timeStamp;
                    // Retrieving the records from the blockchain by passing cin as key.
                    dataStorage.getFormData(cin, (err, items) => {
                        if (err) throw err;
                        if (items && items.length) {
                            var records = [];
                            async.forEach(items, (item, callback_1) => {
                                    if (err) callback_1(err);
                                    var date = new Date(item["timestamp"]).toDateString();
                                    var time = new Date(item["timestamp"]).toLocaleTimeString();
                                    timeStamp = item["timestamp"];
                                    dataStorage.getDocumentData(item["documents"], (err, document_data) => {
                                        if (err) callback_1(err);
                                        if (document_data && document_data["content"] != null) {
                                            // Retrieving the data from blockchain by passing key as parameters.
                                            dataStorage.getKycCategoriesFromBlockchain("kycCode", (err, kyc_cat) => {
                                                // if any error it will reject error.
                                                if (err) callback_1(err);
                                                if (kyc_cat) {
                                                    // Retrieving the data from blockchain by passing key as parameters.
                                                    dataStorage.getKycCategoriesFromBlockchain(item["kyc_code_categories"], (err, kyc_code) => {
                                                        // if any error it will reject error.
                                                        if (err) callback_1(err);
                                                        if (kyc_code) {
                                                            formModel.getPriceByDocAddress(item["documents"], (err, dbValue) => {
                                                                if (err) callback_1(err);
                                                                if(dbValue && dbValue["user_address"] != null) {
                                                                    userModel.getUserByUserAddress(dbValue["user_address"], (err, result2) => {
                                                                        if(err) callback_1(err);
                                                                        if (true) {
                                                                            records.push({
                                                                                owner: result2["username"],
                                                                                date: date, timestamp: timeStamp, "categories": kyc_cat[item["kyc_code_categories"]], "sub_categories": kyc_code[item["kyc_sub_categories"]], metadata: item["metadata"],
                                                                                "document_address": item["documents"],
                                                                                ispurchased: true, isWhiteListed: true
                                                                            });
                                                                            callback_1();
                                                                        }
                                                                        else {
                                                                            callback_1();
                                                                        }
                                                                    });
                                                                }
                                                                 else {
                                                                     callback_1();
                                                                 }   
                                                            });
                                                        }
                                                        else {
                                                            callback_1();
                                                        }
                                                    });
                                                }
                                                else {
                                                    callback_1();
                                                }
                                            });
                                        }
                                        else {
                                            callback_1();
                                        }
                                    });
                            }, (err) => {
                                if (err) throw err;
                                records.sort((a, b) => { return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0); });
                                // Render the view search docment page with parameters.
                                res.render('view_record_details', { "data": records, cin: cin });
                            });
                        }
                        else {
                            req.flash("error_msg", "Unable to fetch data from private database.");
                            res.redirect('/user/kyc_corporate_search_record');
                        }
                    });     
                } else {
                    req.flash('error_msg', "You status is pending on admin side.");
                    res.redirect('/user/kyc_corporate_search_record');
                }
            });
        } catch (error) {
            // If any error occured in the try block the catch block will handle the request.
            res.render('view_record_details', { error_msg: error });
        }
    }
}