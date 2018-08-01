const notificationConfig = require("../configs/notification_config")
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const init = require('../init');

const dataStorage = require('../BlockchainLib/storage');
const common_utility = require('../lib/common_utility');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + notificationConfig.MONGO_IP_ADDRESS + ':' + notificationConfig.MONGO_PORT + '/primechainkycmember');
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
    },
    status: {
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

// Checking whether an user already exists or not?
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
        bcrypt.hash(password, salt, function (err, hash) {
            db.collection('users').update({ email: email }, {
                $set: {
                    password: hash
                }
            }, callback);
        });
    });
};

// It verifies the user details by using email, random and update the user details in user collection.
module.exports.verifyUser = (email, secret, random, callback) => {
    var query = { email: email, random: random };
    db.collection('users').findOne(query, (err, user) => {
       if (err) throw err;
       if (user != null) {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw err;
                bcrypt.hash(secret, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    let userName = user.member_cin;
                    dataStorage.getAddresses(userName, (err, address) => {
                        if (err) throw err;
                        user.user_address = address;
                        dataStorage.getUserPubKey(userName, (error, public_key) =>{
                            user.public_key = public_key.toString('utf8');
                            db.collection('users').update({ email: email }, {
                            $set: {
                                password: hash,
                                user_address: address,
                                public_key: user.public_key,
                                checked: 'y'
                            }
                            }, callback);
                        });
                   });
                });
            });
        }
        else {
            callback(null, null);
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

module.exports.getUserByUserAddress = (user_address, callback) => {
    var query = { user_address: user_address };
    db.collection('users').findOne(query, (err, user_info) => {
        if (err) { return callback(err, null); }
        else { callback(null, user_info); }
    });
};

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};

module.exports.verifyPassword = (email, password, callback) => {
    db.collection('users').findOne({ email: email }, (err, user) => {
        bcrypt.compare(password, user.password, function (err, isMatch) {
            if (err) throw err;
            callback(null, isMatch);
        });
    });
}

module.exports.updateRandom = (email, random, callback) => {
    db.collection('users').update({ email: email }, {
        $set: {
            random: random
        }
    }, callback);
};

