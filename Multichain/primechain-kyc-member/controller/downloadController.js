const dataStorage = require('../BlockchainLib/storage');
const config = require('../configs/blockchain_config');
const common_utility = require('../lib/common_utility');

module.exports = {
    download_document: (req, res, next) => {
        try {
            let result = common_utility.hex2json(req.body.key);
            // Querying the data from the blockchain
            dataStorage.getStreamItem(config["STREAMS"]["KYC_RECORD_STREAM"], req.body.document_txid, (err, data_info) => {
                if (err) { return next(err); }

                if (data_info) {
                    // Retrieving the actual data from the blockchain by passing txid and vout.
                    dataStorage.getTransactionData(data_info["txid"], data_info["vout"], (err, data_hex) => {
                        if (err) { return next(err); }

                        let data_json = common_utility.hex2json(data_hex);
                        let decrypted_data = common_utility.decryptiv(data_json, result["password"], result["iv"]);
                        let decrypted_data_json = common_utility.str2json(decrypted_data);
                        let document_data = common_utility.hex2bin(decrypted_data_json["data"]);

                        res.writeHead(200, {
                            'Content-Type': decrypted_data_json["mimetype"],
                            'Content-disposition': 'attachment;filename=' + decrypted_data_json["name"],
                            'Content-Length': document_data.length
                        });
                        // push the file data in response
                        res.end(document_data);

                    });
                }
                else {
                    // flash is used to display message in the view page.
                    req.flash("error_msg", "You are not authorized to download this file");
                    res.redirect(common_utility.refererPathExtractor(req));
                }
            });
        }
        catch (error) {
            //  flash is used to display the message in the view page.
            req.flash("error_msg", "You are not authorized to download this file");
            res.redirect(common_utility.refererPathExtractor(req));

        }
    }
}
