const dataStorage = require('../BlockchainLib/storage');
const formModel = require('../model/form');
const config = require('../configs/blockchain_config');
const whiteListModel = require('../model/whitelist');

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

                                                            if (publisher_data) {

                                                                _resolve({ "time": time, "date": date, timestamp: timeStamp, "owner": publisher_data["member_name"], "metadata": document_data["metadata"], "categories": kyc_cat[document_data["kyc_code_categories"]], "sub_categories": kyc_code[document_data["kyc_sub_categories"]], "document_txid": document_txid, "member_api_url": publisher_data["member_api_url"], publisher_address: publisher_address, isWhiteListed: true });
                                                            }
                                                            else {
                                                                whiteListModel.getMemberDetailsByAddress(publisher_address, (err, member_details) => {
                                                                    if (err) _reject(err);
                                                                    if (member_details) {
                                                                        _resolve({ "time": time, "date": date, timestamp: timeStamp, "owner": publisher_data["member_name"], "metadata": document_data["metadata"], "categories": kyc_cat[document_data["kyc_code_categories"]], "sub_categories": kyc_code[document_data["kyc_sub_categories"]], "document_txid": document_txid, "member_api_url": publisher_data["member_api_url"], publisher_address: publisher_address, isWhiteListed: true });
                                                                    }
                                                                    else {
                                                                        _resolve({ "time": time, "date": date, timestamp: timeStamp, "owner": publisher_data["member_name"], "metadata": document_data["metadata"], "categories": kyc_cat[document_data["kyc_code_categories"]], "sub_categories": kyc_code[document_data["kyc_sub_categories"]], "document_txid": document_txid, "member_api_url": publisher_data["member_api_url"], publisher_address: publisher_address, isWhiteListed: false });
                                                                    }
                                                                });
                                                            }
                                                        }
                                                        else {
                                                            _resolve(null);
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
                        console.error(err);
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
    }
}