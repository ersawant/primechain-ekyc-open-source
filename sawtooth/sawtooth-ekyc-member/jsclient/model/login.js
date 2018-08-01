const notificationConfig = require("../configs/notification_config")
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + notificationConfig.MONGO_IP_ADDRESS + ':' + notificationConfig.MONGO_PORT + '/primechainkycmember');
var db = mongoose.connection;

var Schema = mongoose.Schema;

// login
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

module.exports = mongoose.model('Login', loginSchema);

module.exports.recordLoginInDB = (newLogin, callback) => {
    newLogin.save(callback);
};

module.exports.getloginDetails = (callback) => {
    db.collection('logins').findOne({}, { sort: { timestamp: -1 }, limit: 1 }, callback);
}
