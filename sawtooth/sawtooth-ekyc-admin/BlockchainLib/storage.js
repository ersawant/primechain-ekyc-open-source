// Importing libraries / files
const init = require('../init');
const common_utility = require('../lib/common_utility');
const { createHash } = require('crypto')
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing')
const protobuf = require('sawtooth-sdk/protobuf')
const fs = require('fs')
const path = require('path')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const async = require('async')

function hash(v) {
    return createHash('sha512').update(v).digest('hex');
}

// Declaring Storage class
class Storage {
    // Creates public and private keys for a user and write it to the file having user name as file name
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

    // Reads key from private key file
    async getUserPriKey(userName, callback) {
        callback(null,fs.readFileSync(process.cwd() + '/keys/' + userName + '.priv'));
    }

    // Reads key from public key file
    async getUserPubKey(userName, callback) {
        callback(null,fs.readFileSync(process.cwd() + '/keys/' + userName + '.pub'));
    }

    // Reads key from the private key file and generates address
    getAddresses(userName, callback) {
        this.privateKeyFile(userName, (err, data) => {
            if(err) throw err;
            if(data){
                this.getUserAddress(userName, (err, address) => {
                    if(err) throw err;
                    callback(null, address);
                });
            }
        });
    }

    // Creates user address by reading public key file.
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
}

module.exports = new Storage();