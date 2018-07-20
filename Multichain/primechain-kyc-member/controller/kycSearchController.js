const dataStorage = require('../BlockchainLib/storage');
const config = require('../configs/blockchain_config');
const whiteListModel = require('../model/whitelist');
const common_utility = require('../lib/common_utility');
const http = require('http');
const formModel = require("../model/form");

module.exports = {
    get_search_record_page: (req, res, next) => {
        res.render('kyc_corporate_search_record');
    },

    post_search_record: (req, res, next) => {
        try {
            var cin = req.body.cin;
            var timeStamp;

            // Retrieving the records from the blockchain by passing stream name and cin as key.
            dataStorage.listStreamKeyItems(config["STREAMS"]["KYC_DATA_STREAM"], cin, 999999, -999999, (err, items) => {
                if (err) { return next(err); }

                // Check the items
                if (items && items.length) {
                    // return promises of each items
                    let promises = items.map(function (item) {

                        var date = new Date(item["blocktime"] * 1000).toDateString();
                        var time = new Date(item["blocktime"] * 1000).toLocaleTimeString();

                        timeStamp = item["blocktime"] * 1000;

                        // create new promise which returns success/failure of blockchain api call
                        return new Promise(function (_resolve, _reject) {
                            // Querying to the blockchain to fetching the actual data.
                            dataStorage.getDataFromDataItem(item["data"], (err, document_data) => {
                                // if any error it will reject error.
                                if (err) _reject(err);

                                // If the data is available in the document_data callback
                                if (document_data && document_data["document"] != null) {
                                    // fetching the document hash from the callback.
                                    let document_hash = document_data["document"]["document"];

                                    // Retrieving the data from blockchain by passing stream name and key as parameters.
                                    dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_OTHER_STREAM"], "kyc_code_categories", (err, kyc_cat) => {
                                        // if any error it will reject error.
                                        if (err) _reject(err);

                                        // Retrieving the data from blockchain by passing stream name and key as parameters.
                                        dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_OTHER_STREAM"], document_data["kyc_code_categories"], (err, kyc_code) => {
                                            // if any error it will reject error.
                                            if (err) _reject(err);

                                            // Retrieving the data from blockchain by passing stream name, key, count and start as parameters.
                                            dataStorage.listStreamKeyItems(config["STREAMS"]["KYC_RECORD_STREAM"], document_hash, 1, -1, (err, document_file) => {
                                                // if any error it will reject error.
                                                if (err) _reject(err);

                                                // If the record is found from the callback
                                                if (document_file && document_file.length) {
                                                    // fetching the publisher address abd the document txid from the callback response.
                                                    let publisher_address = document_file[0]["publishers"][0];
                                                    let document_txid = document_file[0]["txid"];
                                                    // Retrieving the data from blockchain by passing stream name and key as parameters.
                                                    dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], publisher_address, (err, publisher_data) => {
                                                        if (err) _reject(err);

                                                        if (publisher_address === req.user.user_address) {

                                                            _resolve({ "time": time, "date": date, timestamp: timeStamp, "owner": publisher_data["member_name"], "metadata": document_data["metadata"], "categories": kyc_cat[document_data["kyc_code_categories"]], "sub_categories": kyc_code[document_data["kyc_sub_categories"]], "document_txid": document_txid, "member_api_url": publisher_data["member_api_url"], publisher_address: publisher_address, isWhiteListed: true });
                                                        }
                                                        else {
                                                            let member_api_url = publisher_data["member_api_url"];
                                                            let parsed_url = common_utility.parseUrl(member_api_url);

                                                            let options = {
                                                                hostname: parsed_url.hostname,
                                                                port: parsed_url.port,
                                                                path: '/user/api/authorize_view_document',
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json'
                                                                }
                                                            };

                                                            let authenticate_req = http.request(options, (authenticate_res) => {
                                                                let responseString = "";

                                                                authenticate_res.on('data', (data) => {
                                                                    responseString += data;
                                                                });

                                                                authenticate_res.on('end', () => {
                                                                    let result = JSON.parse(responseString);

                                                                    if (result && result["success"]) {

                                                                        let isWhiteListed = result["is_authorized"];

                                                                        _resolve({ "time": time, "date": date, timestamp: timeStamp, "owner": publisher_data["member_name"], "metadata": document_data["metadata"], "categories": kyc_cat[document_data["kyc_code_categories"]], "sub_categories": kyc_code[document_data["kyc_sub_categories"]], "document_txid": document_txid, "member_api_url": publisher_data["member_api_url"], publisher_address: publisher_address, key: result["key"], isWhiteListed: isWhiteListed });
                                                                    }
                                                                    else {
                                                                        _resolve({ "time": time, "date": date, timestamp: timeStamp, "owner": publisher_data["member_name"], "metadata": document_data["metadata"], "categories": kyc_cat[document_data["kyc_code_categories"]], "sub_categories": kyc_code[document_data["kyc_sub_categories"]], "document_txid": document_txid, "member_api_url": publisher_data["member_api_url"], publisher_address: publisher_address, isWhiteListed: false });
                                                                    }
                                                                });
                                                            });

                                                            let authenticate_req_data = {
                                                                purchaser_address: req.user.user_address,
                                                                document_txid: document_txid
                                                            };

                                                            authenticate_req.write(JSON.stringify(authenticate_req_data));
                                                            authenticate_req.end();
                                                        }

                                                    });
                                                }
                                                else {
                                                    _resolve(null);
                                                }
                                            });
                                        });
                                    });
                                }
                                else {
                                    _resolve(null);
                                }
                            });
                        });

                    });
                    // Represents the completion of an asynchronous operation
                    Promise.all(promises).then((data) => {
                        let records = [];
                        data.forEach((record) => {
                            if (record)
                                records.push(record);
                        });
                        records.sort((a, b) => { return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0); });
                        // Render the view search docment page with parameters.
                        res.render('view_record_details', { "data": records, cin: req.body.cin });
                    }).catch((err) => {
                        // throw error if any of the api call fails
                        return next(err);
                    });
                }
                // Render the view search docment page.
                else {
                    res.render('view_record_details');
                }
            });
        } catch (error) {
            // If any error occured in the try block the catch block will handle the request.
            res.render('view_record_details', { error_msg: error });
        }
    },

    get_authorize_view_document: (req, res, next) => {
        try {
            let purchaser_address = req.body.purchaser_address;
            let document_txid = req.body.document_txid;

            whiteListModel.getMemberDetailsByAddress(purchaser_address, (err, records) => {
                if (err) { res.json({ "success": false, is_authorized: false, "msg": "Unable to process request" }); }

                if (records != null) {

                    formModel.getEncryptionKeyByDocumentTxid(document_txid, (err, form_details) => {
                        if (err) { res.json({ "success": false, is_authorized: false, "msg": "Unable to process request" }); }

                        if (form_details) {
                            let key_json = {
                                password: form_details["password"],
                                iv: form_details["iv"]
                            };

                            let key_hex = common_utility.json2hex(key_json);

                            res.json({ "success": true, is_authorized: true, key: key_hex });
                        }
                        else {
                            res.json({ "success": false, is_authorized: false, "msg": "Unable to process request" });
                        }
                    });
                }
                else {
                    res.json({ "success": false, is_authorized: false });
                }
            });
        }
        catch (error) {
            res.json({ "success": false, "msg": error });
        }
    }
}
