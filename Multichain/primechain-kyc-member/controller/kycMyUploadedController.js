const async = require('async');
const formModel = require('../model/form');
const dataStorage = require('../BlockchainLib/storage');
const config = require('../configs/blockchain_config');


module.exports = {
    get_my_uploaded_records: (req, res, next) => {
        try {
            var my_records = [];
            var timeStamp;
            formModel.find((err, form_details) => {
                if (err) { return next(err); }
                
                if (form_details) {
                    async.forEach(form_details, (form_item, form_cb) => {
                        dataStorage.getStreamItem(config["STREAMS"]["KYC_DATA_STREAM"], form_item["form_txid"], (err, form_tx_details) => {
                            if (err) { return form_cb(err, null); }

                            if (form_tx_details && form_tx_details["data"] && form_tx_details["publishers"][0] === req.user.user_address) {
                                dataStorage.getDataFromDataItem(form_tx_details["data"], (err, form_item_details) => {
                                    if (err) { return form_cb(err, null); }

                                    if (form_item_details) {
                                        dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_OTHER_STREAM"], "kyc_code_categories", (err, kyc_cat) => {
                                            if (err) { return form_cb(err, null); }

                                            if (kyc_cat) {
                                                dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_OTHER_STREAM"], form_item_details["kyc_code_categories"], (err, kyc_code) => {
                                                    if (err) { return form_cb(err, null); }

                                                    if (kyc_code) {
                                                        dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], form_tx_details["publishers"][0], (err, publisher_data) => {
                                                            if (err) { return form_cb(err, null); }

                                                            if (publisher_data) {
                                                                timeStamp = form_tx_details["time"] * 1000;
                                                                let date = new Date(timeStamp).toDateString();

                                                                my_records.push({ date: date, timestamp: timeStamp, "cin": form_item_details["cin"], "metadata": form_item_details["metadata"], "categories": kyc_cat[form_item_details["kyc_code_categories"]], "sub_categories": kyc_code[form_item_details["kyc_sub_categories"]], "document_txid": form_item["document_txid"], publisher_address: form_tx_details["publishers"][0] });

                                                                form_cb();

                                                            } else {
                                                                form_cb();
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        form_cb();
                                                    }
                                                });
                                            }
                                            else {
                                                form_cb();
                                            }
                                        });
                                    }
                                    else {
                                        form_cb();
                                    }
                                });
                            } else {
                                form_cb();
                            }
                        });
                    }, (err) => {
                        if (err) throw err;
                        my_records.sort((a, b) => { return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0); });
                        res.render('kyc_corporate_my_uploaded_records', { data: my_records });
                    });
                }
            });
        } catch (error) {
            res.render('kyc_corporate_my_uploaded_records', { error_msg: error });
        }
    }
}