// Importing libraries / files
const mc = require('../multichain');
const common_utility = require('../lib/common_utility');

// Declaring Storage class
class Storage {
    // Querying to blockchain for getting blockchain info
    getMCInfo() {
        mc.getInfo((err, info) => {
            if (err) {
                return err;
            }
        });
    }

    // Querying to blockchain for creating new address.
    getNewAddress(callback) {
        mc.getNewAddress((err, address) => {
            if (err) { return callback(err, null); }
            else { callback(null, address); }
        });
    }

    // Querying to blockchain for getting addreses from the blockchain.
    getAddresses(callback) {
        mc.getAddresses((err, addresses) => {
            if (err) { return callback(err, null); }
            else { callback(null, addresses); }
        });
    }

    // Used to send smart assest form one address to another address.
    validateAddress(address, callback) {
        mc.validateAddress({ address: address }, (err, is_valid) => {
            if (err) { return callback(err, null); }
            else { callback(null, is_valid); }
        });
    }

    // Granting Permissions for an address.
    grant(addresses, permissions, callback) {
        mc.grant({ addresses: addresses, permissions: permissions }, (err, is_granted) => {
            if (err) { return callback(err, null); }
            else { callback(null, true); }
        });
    }

    // Querying data form the blockchain by passing stream name and key as parameters.
    getMostRecentStreamDatumForKey(stream_name, key, callback) {
        var that = this;
        // get the recent data in blockchain based on stream and key
        that.listStreamKeyItems(stream_name, key, 1, -1, (err, result) => {
            // return error in callback result if api fails
            if (err) { return callback(err, null) };

            // check if result is not null and empty
            if (result && result.length) {
                // get the data from the result
                that.getDataFromDataItem(result[0]["data"], (err, data_item) => {
                    if (err) { return callback(err, null); }
                    else { callback(null, data_item); }
                });
            }
            else {
                // return error in callback result as no items found
                callback(null, null);
            }
        });
    }

    getDataFromDataItem(dataItem, callback) {
        // check if data is string
        if (typeof dataItem == 'string') {

            // convert the hex data to json object
            let data = common_utility.hex2json(dataItem);

            // return the data in callback as success
            callback(null, data);
        }
        else {
            // get the data from the blockchain by transaction id
            mc.getTxOutData({ txid: dataItem["txid"], vout: dataItem["vout"] }, (err, result) => {
                // return error in callback result if api fails
                if (err) callback(err, null);

                // convert the hex data to json object
                let data = common_utility.hex2json(result);

                // return the data in callback as success
                callback(null, data);
            });
        }
    }

    // Pushing data to the blockchain 
    publishDataToBlockchain(stream_name, key, data, address, callback) {
        if (address == null) {
            mc.publish({ stream: stream_name, key: key, data: data }, (err, publish_txid) => {
                if (err) { return callback(err, null); }
                else { callback(null, publish_txid); }
            });
        }
        else {
            mc.publishFrom({ from: address, stream: stream_name, key: key, data: data }, (err, publish_txid) => {
                if (err) { return callback(err, null); }
                else { callback(null, publish_txid); }
            });

        }
    }

    // This function is called from web application to push fromData and files to the blockchain.
    uploadFormDataToBlockchain(formData, key, address, data_stream_name, files = null, file_stream_name = null, callback) {
        let that = this;

        //  check if file stream name is null the assign the data stream name
        if (!file_stream_name)
            file_stream_name = data_stream_name;

        let form_data = {};

        // iterate through all formData object keys and add to form_data
        Object.keys(formData).forEach(function (_key) {
            form_data[_key] = formData[_key];
        });

        // check if files data object is not empty and has keys/values
        if (files && Object.keys(files).length) {
            let files_hash = {};

            // upload the files to blockchain by iterating through files data object keys.
            // As the blockchain api is an async call, create promise objects with sucess(resolve) / failure(reject) details and assign its references to variable (promises array)
            var promises = Object.keys(files).map(function (_key) {

                // create new promise which returns success/failure of blockchain api call for uploading the file
                return new Promise(function (resolve, reject) {

                    // create file object which needs to be saved in blockchain
                    let file_info = {
                        name: files[_key].name,
                        mimetype: files[_key].mimetype,
                        data: common_utility.bin2hex(files[_key].data)
                    };

                    // get the file hash from the uploaded file data
                    let file_hash = common_utility.getFileHash(files[_key].data);

                    // assign the file hash to the file object
                    files_hash[_key] = file_hash;

                    // convert the json object to hexadecimal
                    let file_data = common_utility.json2hex(file_info);

                    // publish file data to blockchain
                    that.publishDataToBlockchain(file_stream_name, file_hash, file_data, address, (err, result) => {
                        // fail the api call (promise) by rejecting it and pass the error details as a parameter
                        if (err) reject(err);

                        // mark the api call (promise) as success by resolving it and pass the success result as a parameter
                        resolve();
                    });
                });
            });
            // wait till all api calls (promises) for uploading files in blockchain are proccessed
            Promise.all(promises).then(function () {

                // assign the uploaded files hashes to form data object
                if (files_hash && Object.keys(files_hash).length)
                    form_data['files'] = files_hash;

                // convert the json object to hexadecimal
                let data = common_utility.json2hex(form_data);

                // publish the form data to blockchain
                that.publishDataToBlockchain(data_stream_name, key, data, address, callback);
            }).catch((err) => {
                // return error in callback if any of the api call fails
                callback(err, null);
            });
        }
        else {
            // convert the json object to hexadecimal
            let data = common_utility.json2hex(form_data);

            // publish the form data to blockchain
            that.publishDataToBlockchain(data_stream_name, key, data, address, callback);
        }
    }

    // This function is called from web application to push fromData and files to the blockchain. the file will encrypted using aes-256-gcm algorithm.
    encryptAndUploadFormDataToBlockchain(password, iv, formData, key, address, data_stream_name, documents = null, document_stream_name = null, callback) {
        let that = this;

        //  check if documents stream name is null the assign the data stream name
        if (!document_stream_name)
            document_stream_name = data_stream_name;

        let form_data = {};

        // iterate through all formData object keys and add to form_data
        Object.keys(formData).forEach(function (_key) {
            form_data[_key] = formData[_key];
        });

        // check if documents data object is not empty and has keys/values
        if (documents && Object.keys(documents).length) {
            let documents_hash = {};

            // upload the documents to blockchain by iterating through documents data object keys.
            // As the blockchain api is an async call, create promise objects with success(resolve) / failure(reject) details and assign its references to variable (promises array)
            var promises = Object.keys(documents).map(function (_key) {

                // create new promise which returns success/failure of blockchain api call for uploading the document
                return new Promise(function (resolve, reject) {

                    // create document object which needs to be saved in blockchain
                    let document_info = {
                        name: documents[_key].name,
                        mimetype: documents[_key].mimetype,
                        data: common_utility.bin2hex(documents[_key].data)
                    };

                    // get the document hash from the uploaded document data
                    let document_hash = common_utility.getDocumentHash(documents[_key].data);
                    // assign the document hash to the document object
                    documents_hash[_key] = document_hash;

                    // convert the json object to hexadecimal
                    let document_data = common_utility.json2str(document_info);
                    // encrypt the document data
                    let encrypted_document_data = common_utility.encryptiv(document_data, password, iv);

                    let encrypted_document_data_hex = common_utility.json2hex(encrypted_document_data);

                    // publish document data to blockchain
                    that.publishDataToBlockchain(document_stream_name, document_hash, encrypted_document_data_hex, address, (err, document_txid) => {
                        // fail the api call (promise) by rejecting it and pass the error details as a parameter
                        if (err) reject(err);
                        // mark the api call (promise) as success by resolving it and pass the success result as a parameter
                        resolve({ document_txid: document_txid });
                    });
                });
            });
            // wait till all api calls (promises) for uploading documents in blockchain are proccessed
            Promise.all(promises).then(function (documents_result) {
                // assign the uploaded documents hashes to form data object
                if (documents_hash && Object.keys(documents_hash).length)
                    form_data['document'] = documents_hash;

                // convert the json object to hexadecimal
                let data = common_utility.json2hex(form_data);

                // publish the form data to blockchain
                that.publishDataToBlockchain(data_stream_name, key, data, address, (err, txid) => {
                    if (err) { return callback(err, null); }
                    else {
                        let transactionIds = {
                            form_txid: txid,
                            document_txid: documents_result[0]["document_txid"]
                        };
                        callback(null, transactionIds);
                    }
                });
            }).catch((err) => {
                // return error in callback if any of the api call fails
                callback(err, null);
            });
        }
        else {
            // convert the json object to hexadecimal
            let data = common_utility.json2hex(form_data);

            // publish the form data to blockchain
            that.publishDataToBlockchain(data_stream_name, key, data, address, (err, txid) => {
                if (err) { return callback(err, null); }
                else { callback(null, txid); }
            });
        }
    }

    // Digitally sigining the data.
    signMessage(address, message, callback) {
        mc.signMessage({ address: address, message: message }, (err, signature) => {
            if (err) { return callback(err, null); }
            else { callback(null, signature); }
        });
    }

    // Verfiying the signature by pasiing the address, signature, and message
    verifySignature(address, signature, message, callback) {
        mc.verifyMessage({ address: address, signature: signature, message: message }, (err, is_verified) => {
            if (err) { return callback(err, null); }
            else { callback(null, true); }
        });
    }

    // Signing the documents and push to the blockchain.
    signDocuments(address, documents, signature_stream, callback) {
        let that = this;

        // upload the documents to blockchain by iterating through documents data object keys.
        // As the blockchain api is an async call, create promise objects with sucess(resolve) / failure(reject) details and assign its references to variable (promises array)
        var promises = Object.keys(documents).map(function (_key) {

            // create new promise which returns success/failure of blockchain api call for uploading the document
            return new Promise(function (resolve, reject) {
                // get the document hash from the uploaded document data
                let document_hash = common_utility.getDocumentHash(documents[_key].data);

                that.signMessage(address, document_hash, (err, signature) => {
                    // fail the api call (promise) by rejecting it and pass the error details as a parameter
                    if (err) reject(err);
                    // convert the signature to hex
                    let signatureInHex = common_utility.bin2hex(signature);

                    that.publishDataToBlockchain(signature_stream, document_hash, signatureInHex, address, (err, result) => {
                        // fail the api call (promise) by rejecting it and pass the error details as a parameter
                        if (err) reject(err);

                        // mark the api call (promise) as success by resolving it and pass the success result as a parameter
                        resolve({ signature_transaction_id: result });
                    });
                });
            });
        });
        Promise.all(promises).then(function (result) {
            // return result in callback if any of the api call fails
            callback(null, result);
        }).catch((err) => {
            // return error in callback if any of the api call fails
            callback(err, null);
        });
    }

    // Querying data from a particular stream from blockchain.
    getStreamItems(stream_name, count, start, callback) {
        mc.listStreamItems({ "stream": stream_name, "verbose": false, "count": count, "start": start, "local-ordering": true }, (err, stream_items) => {
            if (err) { return callback(err, null); }
            else { callback(null, stream_items); }
        });
    }

    // Querying data from a particular stream from blockchain.
    listStreamItems(stream_name, callback) {
        this.getStreamItems(stream_name, 999999, -999999, (err, stream_items) => {
            if (err) { return callback(err, null); }
            else { callback(null, stream_items); }
        });
    }

    // Querying data from the blockchain by passing stream name and txid.
    getStreamItem(stream_name, txid, callback) {
        mc.getStreamItem({ "stream": stream_name, "txid": txid, "verbose": true }, (err, stream_item) => {
            if (err) { return callback(err, null); }
            else { callback(null, stream_item); }
        });
    }

    // Querying data from the blockchain by passing stream name and address.
    getPublisherStreamItems(stream_name, address, count, start, callback) {
        mc.listStreamPublisherItems({ "stream": stream_name, "address": address, "verbose": false, "count": count, "start": start, "local-ordering": true }, (err, publisher_items) => {
            if (err) { return callback(err, null); }
            else { callback(null, publisher_items); }
        });
    }

    // Querying data from the blockchain by passing stream name and address
    listStreamPublisherItems(stream_name, address, callback) {
        this.getPublisherStreamItems(stream_name, address, 999999, -999999, (err, publisher_items) => {
            if (err) { return callback(err, null); }
            else { callback(null, publisher_items); }
        });
    }

    // Querying data from the blockchain by sending stream name.
    getStreamKeys(stream_name, count, start, callback) {
        mc.listStreamKeys({ "stream": stream_name, "key": "*", "verbose": false, "count": count, "start": start, "local-ordering": true }, (err, stream_keys) => {
            if (err) { return callback(err, null); }
            else { callback(null, stream_keys); }
        });
    }

    // Querying data from the blockchain by sending stream name and key.
    listStreamKeys(stream_name, callback) {
        this.getStreamKeys(stream_name, 999999, -999999, (err, stream_keys) => {
            if (err) { return callback(err, null); }
            else { callback(null, stream_keys); }
        });
    }

    // Querying data from the blockchain by sending stream name and key.
    listStreamKeyItems(stream_name, key, count, start, callback) {
        mc.listStreamKeyItems({ stream: stream_name, key: key, verbose: true, count: count, start: start, "local-ordering": true }, (err, stream_key_items) => {
            if (err) { return callback(err, null); }
            else { callback(null, stream_key_items); }
        });
    }

    // Fetching information from blockchain by passing txid.
    getTransactionInfo(txid, callback) {
        mc.getTxOut({ txid: txid, vout: 1 }, (err, tx_info) => {
            if (err) { return callback(err, null); }
            else { callback(null, tx_info); }
        });
    }

    // Fetching data from blockchain by sending txid and vout.
    getTransactionData(txid, vout, callback) {
        mc.getTxOutData({ txid: txid, vout: vout }, (err, data_hex) => {
            if (err) { return callback(err, null); }
            else { callback(null, data_hex); }
        });
    }
}

module.exports = new Storage();