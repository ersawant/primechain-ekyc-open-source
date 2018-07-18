// Importing libraries / files
const mc = require('../multichain');
const common_utility = require('../lib/common_utility');
const async = require("async");

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
        mc.getNewAddress(callback);
    }

    // Querying to blockchain for getting addreses from the blockchain.
    getAddresses(callback) {
        mc.getAddresses(callback)
    }

    // Querying blockchain for getting the public key.
    validateAddress(address, callback) {
        mc.validateAddress({ address: address }, callback);
    }

    // Granting Permissions for an address.
    grant(addresses, permissions, callback) {
        mc.grant({ addresses: addresses, permissions: permissions }, callback);
    }

    // This function is called by web application for retriving data from the blockchain.
    getMostRecentStreamDatumForKey(stream_name, key, callback) {
        var that = this;
        // get the recent data in blockchain based on stream and key
        that.listStreamKeyItems(stream_name, key, 1, -1, (err, result) => {
            // return error in callback result if api fails
            if (err) callback(err, null);

            // check if result is not null and empty
            if (result && result.length) {
                // get the data from the result
                that.getDataFromDataItem(result[0]["data"], callback);
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
    publishDataToBlockchain(address = null, stream_name, key, data, callback) {
        if (address == null) {
            mc.publish({ stream: stream_name, key: key, data: data }, callback);
        }
        else {
            mc.publishFrom({ from: address, stream: stream_name, key: key, data: data }, callback);
        }
    }


    uploadFormDataToBlockchain(formData, hash_key, address, data_stream_name, documents = null, document_stream_name = null, encryptDocuments = false, signDocuments = false, signature_stream_name = null, callback) {
        let that = this;


        let password = null;
        let iv = null;

        //  check if documents stream name is null the assign the data stream name
        if (!document_stream_name)
            document_stream_name = data_stream_name;

        //  check if documents stream name is null the assign the data stream name
        if (documents && signDocuments && !signature_stream_name) {
            callback("Signature stream name not provided");
        }

        if (documents && encryptDocuments) {
            password = common_utility.generateRandomString(32);
            iv = common_utility.generateRandomString(12);
        }

        let form_data = {};

        // iterate through all formData object keys and add to form_data
        Object.keys(formData).forEach(function (_key) {
            form_data[_key] = formData[_key];
        });

        // check if documents data object is not empty and has keys/values
        if (documents && Object.keys(documents).length) {
            let documents_hash = {};
            let documents_tx = {};

            // upload the documents to blockchain by iterating through documents data object keys.
            // As the blockchain api is an async call
            async.forEach(Object.keys(documents), (_key, _callback) => {
                // check if multiple documents are uploaded
                if (documents[_key].constructor === Array) {
                    let doc_hash = {};
                    //upload all the documents asynchronously to blockchain
                    async.forEachOf(documents[_key], (document, index, _cb) => {
                        // encrypt and publish document to blockchain
                        that.publishDocumentToBlockchain(document, address, document_stream_name, encryptDocuments, password, iv, signDocuments, signature_stream_name, (err, result) => {
                            // resolve the async callback with error
                            if (err) _cb(err);
                            // capture the document hash and transaction ids
                            if (result) {
                                // assign the document hash to the document object
                                form_data["document_hash"] = result["document_hash"];
                                form_data["document_txid"] = result["document_txid"];
                            }
                            // resolve the async callback with no errors
                            _cb();
                        });
                    }, (_err) => {
                        // resolve the async callback with error
                        if (_err) _callback(_err);

                        //  documents_hash[_key] = common_utility.json2str(doc_hash);
                        // resolve the async callback with no errors
                        _callback();
                    });
                }
                else if (documents[_key].constructor === Object) {
                    // encrypt and publish document to blockchain
                    that.publishDocumentToBlockchain(documents[_key], address, document_stream_name, encryptDocuments, password, iv, signDocuments, signature_stream_name, (err, result) => {
                        // resolve the async callback with error
                        if (err) _callback(err);
                        // capture the document hash and transaction ids
                        if (result) {
                            // assign the document hash to the document object
                            form_data["document_hash"] = result["document_hash"];
                            form_data["document_txid"] = result["document_txid"];
                        }
                        // resolve the async callback with no errors
                        _callback();
                    });
                }
                else {
                    // resolve the async callback with no errors
                    _callback();
                }

            }, (err) => {
                // resolve the callback with error details
                if (err) callback(err, null);

                // // assign the uploaded documents hashes to form data object
                // if (documents_hash && Object.keys(documents_hash).length)
                //     form_data['documents'] = documents_hash;

                // convert the json object to hexadecimal
                let form_data_hex = common_utility.json2hex(form_data);

                // publish the form data to blockchain
                that.publishDataToBlockchain(address, data_stream_name, hash_key, form_data_hex, (err, txid) => {
                    if (err) callback(err, null);

                    // resolve the callback with success details
                    callback(null, txid);
                });
            });
        }
        else {
            // convert the json object to hexadecimal
            let data = common_utility.json2hex(form_data);

            // publish the form data to blockchain
            that.publishDataToBlockchain(data_stream_name, key, data, address, callback);
        }
    }

    publishDocumentToBlockchain(document, address, document_stream_name, encryptDocument, password, iv, signDocument, signature_stream_name, callback) {

        let document_info = {
            name: document.name,
            mimetype: document.mimetype,
            data: common_utility.bin2hex(document.data)
        };

        // get the document hash from the uploaded document data
        let document_hash = common_utility.getDocumentHash(document.data);
        let document_hex;

        if (encryptDocument) {
            // convert the json object to hexadecimal
            let document_data = common_utility.json2str(document_info);

            // encrypt the document data
            let encrypted_document_data = common_utility.encryptiv(document_data, password, iv);

            // convert the encrypted data to hexadecimal
            document_hex = common_utility.json2hex(encrypted_document_data);
        }
        else {
            document_hex = common_utility.json2hex(document_info);
        }

        // publish document data to blockchain
        this.publishDataToBlockchain(address, document_stream_name, document_hash, document_hex, (err, document_txid) => {

            // fail the api call (promise) by rejecting it and pass the error details as a parameter
            if (err) callback(err, null);

            if (signDocument) {
                this.signMessage(address, document_hash, (err, signature) => {
                    // fail the api call (promise) by rejecting it and pass the error details as a parameter
                    if (err) callback(err, null);
                    // convert the signature to hex
                    let signatureInHex = common_utility.bin2hex(signature);

                    this.publishDataToBlockchain(address, signature_stream_name, document_hash, signatureInHex, (err, signature_txid) => {
                        // fail the api call (promise) by rejecting it and pass the error details as a parameter
                        if (err) callback(err, null);

                        // mark the api call (promise) as success by resolving it and pass the success result as a parameter
                        callback(null, { document_hash: document_hash, document_txid: document_txid, signature_hex: signatureInHex, signature_txid: signature_txid });
                    });
                });
            }
            else {
                // mark the api call (promise) as success by resolving it and pass the success result as a parameter
                callback(null, { document_hash: document_hash, document_txid: document_txid });
            }
        });
    }

    // Querying data from a particular stream from blockchain.
    getStreamItems(stream_name, count, start, callback) {
        mc.listStreamItems({ "stream": stream_name, "verbose": false, "count": count, "start": start, "local-ordering": true }, callback);
    }

    // Querying data from a particular stream from blockchain.
    listStreamItems(stream_name, callback) {
        this.getStreamItems(stream_name, 999999, -999999, callback);
    }

    // Querying data from the blockchain by passing stream name and txid.
    getStreamItem(stream_name, txid, callback) {
        mc.getStreamItem({ "stream": stream_name, "txid": txid }, callback);
    }

    // Querying data from the blockchain by passing stream name and address.
    getPublisherStreamItems(stream_name, address, count, start, callback) {
        mc.listStreamPublisherItems({ "stream": stream_name, "address": address, "verbose": false, "count": count, "start": start, "local-ordering": true }, callback);
    }

    // Querying data from the blockchain by passing stream name and address.
    listStreamPublisherItems(stream_name, address, callback) {
        this.getPublisherStreamItems(stream_name, address, 999999, -999999, callback);
    }

    // Querying data from the blockchain by passing stream name.
    getStreamKeys(stream_name, count, start, callback) {
        mc.listStreamKeys({ "stream": stream_name, "key": "*", "verbose": false, "count": count, "start": start, "local-ordering": true }, callback);
    }

    // Querying data from the blockchain by sending stream name.
    listStreamKeys(stream_name, callback) {
        this.getStreamKeys(stream_name, 999999, -999999, callback);
    }

    // Querying data from the blockchain by sending stream name and key.
    listStreamKeyItems(stream_name, key, count, start, callback) {
        mc.listStreamKeyItems({ stream: stream_name, key: key, verbose: true, count: count, start: start, "local-ordering": true }, callback);
    }

    // Fetching data from blockchain by sending txid and vout.
    getTransactionData(txid, vout, callback) {
        mc.getTxOutData({ txid: txid, vout: vout }, callback);
    }
}

module.exports = new Storage();