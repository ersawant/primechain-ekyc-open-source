const async = require('async');
const formModel = require('../model/form');
const dataStorage = require('../BlockchainLib/storage');
const userModel = require('../model/user');

module.exports = {
    get_my_uploaded_records: (req, res, next) => {
        try {
            userModel.getUserDetailsByEmail(req.user.email, (err, userDetails) => {
                if(userDetails["status"] === "active") {
                    var my_records = [];
                    var timeStamp;
                    formModel.find((err, form_details) => {
                        if (err) throw err;
                        if (form_details) {
                            async.forEach(form_details, (form_item, form_cb) => {
                                if (form_item) {
                                    dataStorage.getFormData(form_item["cin"],
                                        (err, form_tx_details_list) => {
                                            if (err) {
                                                form_cb(err, null);
                                            }
                                            async.forEach(form_tx_details_list, (form_tx_details, form_tx_cb) => {
                                                if (form_tx_details && (form_tx_details["documents"] === form_item["document_address"]) && form_item["user_address"] === req.user.user_address) {
                                                    dataStorage.getKycCategoriesFromBlockchain("kycCode", (err, kyc_cat) => {
                                                        if (err) throw err;
                                                        if (kyc_cat) {
                                                            dataStorage.getKycCategoriesFromBlockchain(form_tx_details["kyc_code_categories"], (err, kyc_code) => {
                                                                if (kyc_code) {
                                                                    timeStamp = form_tx_details["timestamp"];
                                                                    let date = new Date(timeStamp).toDateString();
                                                                    my_records.push({
                                                                        "cin": form_tx_details["cin"] ,date: date, timestamp: timeStamp, "metadata": form_tx_details["metadata"], "categories": kyc_cat[form_tx_details["kyc_code_categories"]], "sub_categories": kyc_code[form_tx_details["kyc_sub_categories"]], "document_address": form_item["document_address"],
                                                                        price: form_item["price"]
                                                                    });
                                                                    form_tx_cb();
                                                                }
                                                                else {
                                                                    form_tx_cb();
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            form_tx_cb();
                                                        }
                                                    });
                                                } else {
                                                    form_tx_cb();
                                                }
                                            }, form_cb);
                                        });
                                }
                            }, (err) => {
                                if (err) throw err;
                                my_records.sort((a, b) => { return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0); });
                                res.render('kyc_corporate_my_uploaded_records', { data: my_records });
                            });
                        }
                    });     
                } else {
                    res.render('kyc_corporate_my_uploaded_records', {error_msg: "You status is pending on admin side."});
                }
            });
        } catch (error) {
            res.render('kyc_corporate_my_uploaded_records', { error_msg: error });
        }
    }
}