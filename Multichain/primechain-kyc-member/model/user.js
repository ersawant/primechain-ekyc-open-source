// Importing necessary libraries 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../configs/blockchain_config");
const dataStorage = require('../BlockchainLib/storage');
const common_utility = require('../lib/common_utility');
// Storing mongoose connections to a variable called db.
const db = mongoose.connection;
// Intialising a schema
const Schema = mongoose.Schema;

// // Initializing properties to schema, to store the details of an user.
const userSchema = Schema({
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
    member_cin: {
        type: String,
        default: null
    },
    member_website_address: {
        type: String,
        default: null
    },
    member_api_url: {
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

//Exporting user schema,so that we can access on different pages.
module.exports = mongoose.model('User', userSchema);

// Saving the new user details in the database.
module.exports.createNewUser = (newUser, callback) => {
    newUser.save((err, is_saved) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};

// Checking whether an user already exits or not?
module.exports.doesUserExists = (email, random, callback) => {
    var query = { email: email, random: random };
    db.collection('users').findOne(query, (err, is_exists) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};

// Updating user password by sending his/her email, new_password, random.
module.exports.updateResetPassword = (email, password, random, callback) => {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) { return callback(err, null); }
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) { return callback(err, null); }
            db.collection('users').update({ email: email }, {
                $set: {
                    password: hash,
                    random: random
                }
            }, (err, is_updated) => {
                if (err) { return callback(err, null); }
                else { callback(null, true); }
            });
        });
    });
};

// Changes the password when the user click on the change password functionality from an user interface.
module.exports.updateUserPassword = (email, password, callback) => {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) { return callback(err, null); }
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) { return callback(err, null); }
            db.collection('users').update({ email: email }, {
                $set: {
                    password: hash
                }
            }, (err, is_updated) => {
                if (err) { return callback(err, null); }
                else { callback(null, true); }
            });
        });
    });
};

// It verifies the user details by using email, random and update the user details in user collection.
module.exports.verifyUser = (email, secret, random, callback) => {
    var query = { email: email, random: random };

    db.collection('users').findOne(query, (err, user) => {
        if (err) { return callback(err, null); }

        if (user != null) {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) { return callback(err, null); }

                bcrypt.hash(secret, salt, (err, hash) => {
                    if (err) { return callback(err, null); }

                    dataStorage.getNewAddress((err, address) => {
                        if (err) { return callback(err, null); }

                        let new_address = address;

                        dataStorage.validateAddress(new_address, (err, addrData) => {
                            if (err) { return callback(err, null); }

                            let member_data = {
                                "member_name": user.organisation,
                                "member_email": user.email,
                                "member_cin": user.member_cin,
                                "member_public_address": new_address,
                                "member_website_address": user.member_website_address,
                                "member_api_url": user.member_api_url,
                                "status": "pending"
                            };

                            let member_data_hex = common_utility.json2hex(member_data);

                            dataStorage.publishDataToBlockchain(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], new_address, member_data_hex, null, (err, is_published) => {
                                if (err) { return callback(err, null); }

                                if (is_published) {
                                    db.collection('users').update({ email: email }, {
                                        $set: {
                                            password: hash,
                                            user_address: new_address,
                                            public_key: addrData.pubkey,
                                            checked: 'y'
                                        }
                                    }, (err, is_updated) => {
                                        if (err) { return callback(err, null); }
                                        else { callback(null, true); }
                                    });
                                }
                                else {
                                    callback(null, false);
                                }
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
        if (isMatch) { callback(null, true); }
        else { callback(null, false); }
    });
};

module.exports.verifyPassword = (email, password, callback) => {
    db.collection('users').findOne({ email: email }, (err, user) => {
        if (err) { return callback(err, null); }
        bcrypt.compare(password, user.password, function (err, isMatch) {
            if (err) { return callback(err, null); }
            if (isMatch) { callback(null, true); }
            else { callback(null, false); }
        });
    });
}

module.exports.updateRandom = (email, random, callback) => {
    db.collection('users').update({ email: email }, {
        $set: {
            random: random
        }
    }, (err, is_updated) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};



