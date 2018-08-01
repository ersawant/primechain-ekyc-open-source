const notificationConfig = require("../configs/notification_config");
// importing the mongoose library.
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + notificationConfig.MONGO_IP_ADDRESS + ':' + notificationConfig.MONGO_PORT + '/primechainkycadmin',{ useNewUrlParser: true });
var db = mongoose.connection;
// Initializing a schema for mongodb.
var Schema = mongoose.Schema;
// Initializing properties to schema.
var loginSchema = Schema({
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

// Exporting the model so that we can access in different files.
module.exports = mongoose.model('Login', loginSchema);

// It will save the login details in the database.
module.exports.recordLoginInDB = (newLogin, callback) => {
    newLogin.save((err, is_save) => {
        if (err) { return callback(err, null); }
        else { callback(null, true); }
    });
};

// Retrieving the lastest login details of the user.
module.exports.getloginDetailsByEmail = (email, callback) => {
    db.collection('logins').findOne({ email: email }, { sort: { timestamp: -1 }, limit: 1 }, (err, logs_info) => {
        if (err) { return callback(err, null); }
        else { callback(null, logs_info); }
    });
};