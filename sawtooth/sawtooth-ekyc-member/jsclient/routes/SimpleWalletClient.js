const {createHash} = require('crypto')
const {CryptoFactory, createContext } = require('sawtooth-sdk/signing')
const protobuf = require('sawtooth-sdk/protobuf')
const fs = require('fs')
const fetch = require('node-fetch');
const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1')	
const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding')
const async = require('async');

FAMILY_NAME='sawtoothekyc'

function hash(v) {
    return createHash('sha512').update(v).digest('hex');
}

class SimpleWalletClient {
	constructor(userid) {
		const privateKeyStrBuf = this.getUserPriKey(userid);
		const privateKeyStr = privateKeyStrBuf.toString().trim();
		const context = createContext('secp256k1');
		const privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		this.signer = new CryptoFactory(context).newSigner(privateKey);
		this.publicKey = this.signer.getPublicKey().asHex();
		this.address = hash("sawtoothekyc").substr(0, 6);
	}
	
	async getKycFromAddress(addr) {
		let uniqueKey = "kyccategory";
		let data = await this._get_state_data(uniqueKey, addr);
		return data;
	}

	publishDataToSawtoothBlockchain(data, key, callback) {
		var uniqueKey = "formUpload";
		let addr1 = this.getWalleyKey(uniqueKey, key);
		this._wrap_and_send("form_upload",addr1, [data], key);
		let result = {
			addr: addr1,
		}
		callback(null, result);
	}

	getWalleyKey(uniqueKey, addr) {
		return this.address + hash(uniqueKey).substr(0,6) + hash(addr).substr(0,58);
	}

	getUserPriKey(userid) {
		var userprivkeyfile = process.cwd() + '/keys/'+userid+'.priv';
		return fs.readFileSync(userprivkeyfile);
	}	

	getUserPubKey(userid) {
		var userpubkeyfile = process.cwd() + '/keys/'+userid+'.pub';
		return fs.readFileSync(userpubkeyfile);
	}
		
	_wrap_and_send(action, addr, data, key) {
		var payload = ''
		const address = addr;
		var inputAddressList = [address];
		var outputAddressList = [address];
		payload = action + "$" + data[0] + "$" + key;
		var enc = new TextEncoder('utf8');
		const payloadBytes = enc.encode(payload);

		const transactionHeaderBytes = protobuf.TransactionHeader.encode({
			familyName: 'sawtoothekyc',
			familyVersion: '1.0',
			inputs: inputAddressList,
			outputs: outputAddressList,
			signerPublicKey: this.signer.getPublicKey().asHex(),
			nonce: "" + new Date().getTime(),
			batcherPublicKey: this.signer.getPublicKey().asHex(),
			dependencies: [],
			payloadSha512: hash(payloadBytes),
		}).finish();

		const transaction = protobuf.Transaction.create({
			header: transactionHeaderBytes,
			headerSignature: this.signer.sign(transactionHeaderBytes),
			payload: payloadBytes
		});

		const transactions = [transaction]
		const batchHeaderBytes = protobuf.BatchHeader.encode({
			signerPublicKey: this.signer.getPublicKey().asHex(),
			transactionIds: transactions.map((txn) => txn.headerSignature),
		}).finish();

		const batchSignature = this.signer.sign(batchHeaderBytes);
		const batch = protobuf.Batch.create({
			header: batchHeaderBytes,
			headerSignature: batchSignature,
			transactions: transactions,
		});

		const batchListBytes = protobuf.BatchList.encode({
			batches: [batch]
		}).finish();
	
		this._send_to_rest_api(batchListBytes);	
	}

	_get_state_data(uniqueKey, addr) {
			var updatedAddress = this.address + hash(addr).substr(0, 64);
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
	};	

	_send_to_rest_api(batchListBytes){
		if (batchListBytes == null)
		{
            var geturl = 'http://localhost:8008/state/'+this.address
		    return fetch(geturl, {
 		    	method: 'GET',
		    })
		   	.then((response) => response.json())
		   	.then((responseJson) => {
                var data = responseJson.data;
                var amount = new Buffer(data, 'base64').toString();
                return amount;
		   	})
		   	.catch((error) => {
 		   		console.error(error);
		  	}); 	
		}
		else {
		    fetch('http://localhost:8008/batches', {
 		    	method: 'POST',
       		    	headers: {
	              		'Content-Type': 'application/octet-stream'
		    		 },
		    	body: batchListBytes
		    	})
		   .then((response) => response.json())
		   .then((responseJson) => {
		   })
		   .catch((error) => {
 		   	console.error("Response Error", error);
		   }); 	
		}
	}
}

module.exports.SimpleWalletClient = SimpleWalletClient;
