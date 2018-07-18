// Importing mongoose library.
const mongoose = require('mongoose');
// Storing mongoose connections to a variable called db.
var db = mongoose.connection;
// Intialising a schema
var Schema = mongoose.Schema;

// // Initializing properties to schema, schema for storing login details of an user.
const loginSchema = Schema({
    email: {
        type: String,
        default: null
    },
    ip: {
        type: String,
        default: null
    },
    browser: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Login', loginSchema);

module.exports.recordLoginInDB = (newLogin, callback) => {
    newLogin.save((err, is_saved) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};

module.exports.getloginDetailsByEmail = (email, callback) => {
    db.collection('logins').findOne({ email: email }, { sort: { timestamp: -1 }, limit: 1 }, (err, logs_info) => {
        if (err) { return callback(err, null); }
        else { callback(null, logs_info); }
    });
}
