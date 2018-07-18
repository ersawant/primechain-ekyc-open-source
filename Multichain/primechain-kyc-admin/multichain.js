let config = require('./configs/blockchain_config');

const connection = {
    port: config.RPC_PORT,
    host: config.HOST_NAME,
    user: config.RPC_USER,
    pass: config.RPC_PASSWORD
};

const bluebird = require("bluebird");
const multichain = bluebird.promisifyAll(require('./lib/rpccall.js')(connection), { suffix: "Promise" });

multichain.getInfo((err, info) => {
    if (err) {
        console.log("Unable to connect blockchain.");
    }
    else {
        console.log("Connected to blockchain");
    }
})

module.exports = multichain;