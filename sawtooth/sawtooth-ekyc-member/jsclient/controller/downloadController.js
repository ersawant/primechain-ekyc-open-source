const async = require('async');
const formModel = require('../model/form');
const dataStorage = require('../BlockchainLib/storage');
const common_utility = require('../lib/common_utility');

module.exports = {
    download_document: (req, res, next) => {
        try {
            // Querying to database to retrieve the password and iv by passing the document address
            formModel.getPriceByDocAddress(req.body.document_address, (err, result) => {
                if (err) throw err;
                if (result) {
                    // Querying the data from the blockchain
                    dataStorage.getDocumentData(req.body.document_address, (err, data_json) => {
                        if (err) throw err;
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
            console.log("Error", error);
            //  flash is used to display the message in the view page.
            req.flash("error_msg", "You are not authorized to download this file");
            res.redirect(common_utility.refererPathExtractor(req));
        }
    }
}