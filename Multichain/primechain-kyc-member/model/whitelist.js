// importing the libraries 
const mongoose = require('mongoose');

var db = mongoose.connection;

// Initializing a schema for mongodb.
var Schema = mongoose.Schema;

// Initializing properties to schema
var whitelistSchema = new Schema({
    email: {
        type: String,
    },
    public_address: {
        type: String
    },
    member_name: {
        type: String
    },
});

// Exporting the model so that we can access in different files.
module.exports = mongoose.model('whitelist', whitelistSchema);

// Add member details to the private database.
module.exports.add = (newWhitelist, callback) => {
    newWhitelist.save((err, is_saved) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};

// Delete the member details by passing the public address.
module.exports.deleteMemberByAddress = (public_address, callback) => {
    db.collection('whitelists').findOneAndDelete({ public_address: public_address }, (err, is_deleted) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};

// Fetching the member details from database by passing public address.
module.exports.getMemberDetailsByAddress = (public_address, callback) => {
    db.collection('whitelists').findOne({ public_address: public_address }, (err, member_details) => {
        if (err) { return callback(err, null); }
        else { callback(null, member_details); }
    });
};