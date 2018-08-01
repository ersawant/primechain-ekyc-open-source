// Importing libraries / files
const init = require('../init');
const common_utility = require('../lib/common_utility');
const { createHash } = require('crypto')
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing')
const protobuf = require('sawtooth-sdk/protobuf')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
var { SimpleWalletClient } = require('../routes/SimpleWalletClient')
const async = require('async')

function hash(v) {
    return createHash('sha512').update(v).digest('hex');
}

// Declaring Storage class
class Storage {
    async privateKeyFile(userName, callback) {
        const context = createContext('secp256k1')
        const privateKey = context.newRandomPrivateKey()
        const signer = new CryptoFactory(context).newSigner(privateKey)
        const privateKeyHex = privateKey.asHex();
        const publicKeyHex = signer.getPublicKey().asHex();

        await fs.writeFile(path.resolve(__dirname, '.././keys/' + userName + '.priv'), privateKeyHex, (err) => {
            if (err) {
                return console.log(err)
            }
            callback(null, true);
        })

        await fs.writeFile(path.resolve(__dirname, '.././keys/' + userName + '.pub'), publicKeyHex, (err) => {
            if (err) {
                return console.log(err)
            }
            callback(null, true);
        })
    }

    async getUserPriKey(userName, callback) {
        callback(null,fs.readFileSync(process.cwd() + '/keys/' + userName + '.priv'));
    }

    async getUserPubKey(userName, callback) {
        callback(null,fs.readFileSync(process.cwd() + '/keys/' + userName + '.pub'));
    }

    // Querying to blockchain for getting addreses from the blockchain.
    getAddresses(userName, callback) {
        this.privateKeyFile(userName,(err, data)=>{
            if(err) throw err;
            if(data){
                this.getUserAddress(userName, (err, address) => {
                    if(err) throw err;
                    callback(null, address);
                });
            }
        });
    }

    getUserAddress(userName, callback) {
        this.getUserPriKey(userName, (err, privateKeyStrBuf) => {
            if (err) throw err;
            const privateKeyStr = privateKeyStrBuf.toString().trim();
            const context = createContext('secp256k1');
            const privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
            this.signer = new CryptoFactory(context).newSigner(privateKey);
            this.publicKey = this.signer.getPublicKey().asHex();
            this.address = hash("sawtoothekyc").substr(0, 6) + hash(this.publicKey).substr(0, 64);
            callback(null, this.address);
        });
    }

    async getKycCategoriesFromBlockchain(kycAddress, callback) {
        var getData = await this.getKycFromAddress(kycAddress);
        var jsonData = JSON.parse(getData);
        return callback(null, jsonData);
    }

    async getKycFromAddress(addrId) {
        var updatedAddress = hash("sawtoothekyc").substr(0, 6) + hash("kyccategory").substr(0, 6) + hash(addrId).substr(0, 58);
			var geturl = 'http://localhost:8008/state/'+updatedAddress
		    return fetch(geturl, {
 		    	method: 'GET',
		    })
		   	.then((response) => response.json())
		   	.then((responseJson) => {
				var data = responseJson.data;
				var stringData = new Buffer(data, 'base64').toString();
                return stringData;
		   	})
		   	.catch((error) => {
 		   		console.error(error);
		  	});
    }

    async getFormData(addrId, callback) {
        var data = await this._get_data_from_addrId(addrId);
        var jsonConcat = [];
        if(data) {
            data.forEach(function(value){
                var jsonData = common_utility.hex2json(value); 
                jsonConcat.push(jsonData);   
            });
            callback(null, jsonConcat);
        } else {
            callback(null, null);
        }
    }

    async getDocumentData(addressId, callback) {
        var data = await this._get_data_from_doc_addrId(addressId);
        var jsonData = common_utility.hex2json(data);
        callback(null, jsonData);
    }

    _get_data_from_doc_addrId(addressId) {
        var geturl = 'http://localhost:8008/state/'+addressId;
        return fetch(geturl, {
            method: 'GET',
        })
        .then((response) => response.json())
        .then((responseJson) => {
            var data = responseJson.data;
            if(data === undefined) {
                return null;
            } else {
                var stringData = new Buffer(data, 'base64').toString();
                return stringData;
            }
        })
        .catch((error) => {
            console.error(error);
        }); 	
    };

    _get_data_from_addrId(addr) {
        var updatedAddress = hash("sawtoothekyc").substr(0,6) + hash("formUpload").substr(0,6) + hash(addr).substr(0,58);
        var geturl = 'http://localhost:8008/state/'+updatedAddress;
        return fetch(geturl, {
            method: 'GET',
        })
        .then((response) => response.json())
        .then((responseJson) => {
            var data = responseJson.data;
            if(data === undefined) {
                return null;
            } else {
                var stringData = new Buffer(data, 'base64').toString();
                var splitStringArray = stringData.split("$");
                return splitStringArray;
            }
        })
        .catch((error) => {
            console.error(error);
        }); 	
    };
    
    // Pushing data to the blockchain 
    publishDataToBlockchain(userName, key, data, address, callback) {
        var client = new SimpleWalletClient(userName);
        client.publishDataToSawtoothBlockchain(data, key, (err, result) => {
            if (err) callback(err, null, null);
            callback(null, result);
        });
    }

    // This function is called from web application to push fromData and files to the blockchain. the file will encrypted using aes-256-gcm algorithm.
    encryptAndUploadFormDataToBlockchain(password, iv, formData, key, userName, address, documents = null, callback) {
        let that = this;
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
                    that.publishDataToBlockchain(userName, document_hash, encrypted_document_data_hex, address, (err, result) => {
                        // fail the api call (promise) by rejecting it and pass the error details as a parameter
                        if (err) reject(err);
                        // mark the api call (promise) as success by resolving it and pass the success result as a parameter
                        resolve({ document_hash: document_hash, document_address: result["addr"] });
                    });
                });
            });
            // wait till all api calls (promises) for uploading documents in blockchain are proccessed
            Promise.all(promises).then(function (documents_result) {
                // assign the uploaded documents hashes to form data object
                if (documents_hash && Object.keys(documents_hash).length)
                    form_data['documents'] = documents_result[0]["document_address"];

                // convert the json object to hexadecimal
                let data = common_utility.json2hex(form_data);

                // publish the form data to blockchain
                that.publishDataToBlockchain(userName, key, data, address, (err, result) => {
                    if (err) callback(err, null);

                    let result1 = {
                        form_data_address: result["addr"],
                        document_address: documents_result[0]["document_address"]
                    };
                    callback(null, result1);
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
            that.publishDataToBlockchain(data_stream_name, key, data, address, callback);
        }
    }
}

module.exports = new Storage();