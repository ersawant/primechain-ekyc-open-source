const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const config = require("../configs/blockchain_config");
const dataStorage = require('../BlockchainLib/storage');

var db = mongoose.connection;

var Schema = mongoose.Schema;

// User Schema 
var userSchema = Schema({
    username: {
        type: String,
        index: true,
    },
    email: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    designation: {
        type: String,
        default: null
    },
    organisation: {
        type: String,
        default: null
    },
    cell: {
        type: String,
        default: null
    },
    random: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    user_address: {
        type: String,
    },
    public_key: {
        type: String,
    },
    checked: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);

module.exports.createNewUser = (newUser, callback) => {
    newUser.save((err, is_saved) => {
        if (err) {
            return callback(err, null);
        }
        else {
            callback(null, true);
        }
    });
};

module.exports.doesUserExists = (email, random, callback) => {
    let query = { email: email, random: random };
    db.collection('users').findOne(query, (err, user_info) => {
        if (err) {
            return callback(err, null);
        }
        else {
            callback(null, true);
        }
    });
};

module.exports.updateResetPassword = (email, password, random, callback) => {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return callback(err, null);
        }
        else {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    return callback(err, null);
                }
                else {
                    db.collection('users').update({ email: email }, {
                        $set: {
                            password: hash,
                            random: random
                        }
                    }, (err, is_updated) => {
                        if (err) {
                            return callback(err, null);
                        }
                        else {
                            callback(null, true);
                        }
                    });
                }
            });
        }
    });
};

module.exports.updateUserPassword = (email, password, callback) => {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return callback(err, null);
        }
        else {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    return callback(err, null);
                }
                else {
                    db.collection('users').update({ email: email }, {
                        $set: {
                            password: hash
                        }
                    }, (err, is_updated) => {
                        if (err) {
                            return callback(err, null);
                        }
                        else {
                            callback(null, true);
                        }
                    });
                }
            });
        }
    });
};

module.exports.verifyUser = (email, secret, random, callback) => {
    let query = { email: email, random: random };
    db.collection('users').findOne(query, (err, user) => {
        if (err) {
            return callback(err, null);
        }
        if (user != null) {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) { return callback(err, null); }
                bcrypt.hash(secret, salt, (err, hash) => {
                    if (err) { return callback(err, null); }
                    user.password = hash;
                    dataStorage.getAddresses((err, address) => {
                        if (err) { return callback(err, null); }
                        user.user_address = address[0];
                        dataStorage.validateAddress(user.user_address, (err, addrData) => {
                            if (err) { return callback(err, null); }
                            user.public_key = addrData.pubkey;
                            dataStorage.grant(user.user_address, "send,receive,admin,mine", (err, result) => {
                                if (err) { return callback(err, null); }
                                dataStorage.grant(user.user_address, config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"] + ".write,admin", (err, result) => {
                                    if (err) { return callback(err, null); }
                                    dataStorage.grant(user.user_address, config["STREAMS"]["KYC_DATA_STREAM"] + ".write,admin", (err, result) => {
                                        if (err) { return callback(err, null); }
                                        dataStorage.grant(user.user_address, config["STREAMS"]["KYC_RECORD_STREAM"] + ".write,admin", (err, result) => {
                                            if (err) { return callback(err, null); }
                                            dataStorage.grant(user.user_address, config["STREAMS"]["KYC_OTHER_STREAM"] + ".write,admin", (err, result) => {
                                                if (err) { return callback(err, null); }
                                                dataStorage.grant(user.user_address, config["STREAMS"]["KYC_SIGNATURE_STREAM"] + ".write,admin", (err, result) => {
                                                    if (err) { return callback(err, null); }
                                                    db.collection('users').update({ email: email }, {
                                                        $set: {
                                                            password: hash,
                                                            user_address: address[0],
                                                            public_key: addrData.pubkey,
                                                            checked: 'y'
                                                        }

                                                    }, (err, is_verified) => {
                                                        if (err) { return callback(err, null); }
                                                        else { callback(null, true); }
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
        else {
            callback(null, false);
        }
    });
};

module.exports.getUserDetailsByEmail = (email, callback) => {
    var query = { email: email };
    db.collection('users').findOne(query, (err, user_info) => {
        if (err) { return callback(err, null); }
        else { callback(null, user_info); }
    });
};

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) { return callback(err, null); }
        else { callback(null, isMatch); }
    });
};

module.exports.verifyPassword = (email, password, callback) => {
    db.collection('users').findOne({ email: email }, (err, user) => {
        if (err) { return callback(err, null); }
        bcrypt.compare(password, user.password, function (err, isMatch) {
            if (err) { return callback(err, null); }
            else { callback(null, isMatch); }
        });
    });
}

module.exports.updateRandom = (email, random, callback) => {
    db.collection('users').update({ email: email }, {
        $set: {
            random: random
        }
    }, (err, is_set) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};



