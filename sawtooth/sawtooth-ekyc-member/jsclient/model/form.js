const notificationConfig = require("../configs/notification_config");

// importing the mongoose library.
const mongoose = require('mongoose');

// Built-in Promises. Mongoose async operations, like .save() and queries, return ES6 promises. 
mongoose.Promise = global.Promise;
// Connecting to monogo database.

mongoose.connect('mongodb://' + notificationConfig.MONGO_IP_ADDRESS + ':' + notificationConfig.MONGO_PORT + '/primechainkycmember');
var db = mongoose.connection;

// Initializing a schema for mongodb.
var Schema = mongoose.Schema;

// Initializing properties to schema.
var formSchema = Schema({
    cin : {
        type: String
    },
    user_address: {
        type: String
    },
    document_address: {
        type: String
    },
    form_address: {
        type: String
    },
    password: {
        type: String
    },
    iv: {
        type: String
    }
});

// Exporting the model so that we can access in different files.
module.exports = mongoose.model('form', formSchema);

// Saving the from model properties values in private database.
module.exports.createForm = (newForm, callback) => {
    newForm.save(callback);
};

// Fetching the price by passing document txid.
module.exports.getPriceByDocAddress = (document_address, callback) => {
    db.collection('forms').findOne({ document_address: document_address }, callback);
};

// Fetching the price by passing document txid.
module.exports.getCINDataFromDB = (cin, callback) => {
    db.collection('forms').find({ cin: cin }).toArray(function(err, result) {
        if(err) throw err;
        callback(null, result);
    });
};

module.exports.updatePrice = (document_address, price, callback) => {
    db.collection('forms').update({ document_address: document_address }, {
        $set: {
            price: price
        }
    }, callback);
};
