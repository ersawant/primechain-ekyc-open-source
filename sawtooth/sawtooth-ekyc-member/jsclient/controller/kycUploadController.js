const async = require('async');
const dataStorage = require("../BlockchainLib/storage");
const common_utility = require("../lib/common_utility");
const formModel = require("../model/form");
const userModel = require('../model/user');


module.exports = {
    get_kyc_corporate_upload_page: (req, res, next) => {
        try {
            dataStorage.getKycCategoriesFromBlockchain("kycCode", (err, cases) => {
                if (err) throw err;
                if (cases) {
                    res.render('kyc_corporate_upload_record', { cases: cases });
                }
                else {
                    // Render the view page
                    res.render('kyc_corporate_upload_record');
                }
            });
        }
        catch (err) {
            console.log("Error: ", err);
            req.flash('error_msg', "Internal server error occured.");
            res.redirect('/');
        }
    },

    get_document_categories_list: (req, res, next) => {
        try {
            let key = Object.keys(req.body);
            // Querying the most recent record which is pushed to the blockchain by passing stream name and key
            dataStorage.getKycCategoriesFromBlockchain(key[0], (err, items) => {
                if (err) throw err;
                // The response will send back to the ajax with the records which is retreived from blockchain.
                res.json(items);
                res.end();
            });
        }
        catch (e) {
            // If any eror occured the catch block will handle the request.
            res.json(null);
        }
    },

    post_kyc_corporate_upload_record: (req, res, next) => {
        try {
            userModel.getUserDetailsByEmail(req.user.email, (err, userDetails) => {
                    var recorded_data = {};
                    if (req.files != null) {
                    // formData which will goes into to the blochain as unecrypted.
                    let formData = {
                        'cin': req.body.kyc_cin,
                        'timestamp': Date.now(),
                        'kyc_code_categories': req.body.kyc_code_categories,
                        'kyc_sub_categories': req.body.kyc_sub_categories,
                        'metadata': req.body.kyc_document_metadata
                    };
                    // Storing file info in the documents variable.
                    let documents = req.files;
                    // Generating password by calling a function from common utility file to encrypt the file data
                    let password = common_utility.generateRandomString(32);
                    // Generating the iv(initialization vector) by calling a function from common utility, is used to passed along with the password. 
                    let iv = common_utility.generateRandomString(12);
    
                    // This function will be push the formData and file to the blockchain in their respective streams abd returns txids.
                    dataStorage.encryptAndUploadFormDataToBlockchain(password, iv, formData, req.body.kyc_cin, req.user.member_cin, req.user.user_address, documents, (err, result) => {
                        if (err) throw err;
                        // checks wheather any file uploaded by user
                        if (documents && Object.keys(documents).length) {
                            // We are iterating each result with async function call.
                            async.forEach(Object.keys(documents), (document_key, callback) => {
    
                                // Calculating the document hash from the file data by calling a function from common utility.
                                let document_hash = common_utility.getDocumentHash(documents[document_key].data);
    
                                // Creating a model to store following parameters into the database.
                                let newForm = new formModel({
                                    cin: req.body.kyc_cin,
                                    user_address: req.user.user_address,
                                    form_address: result["form_data_address"],
                                    document_address: result["document_address"],
                                    password: password,
                                    iv: iv
                                });
                                // Calling the database to save the record in the database.
                                formModel.createForm(newForm, callback);
                                recorded_data = {
                                    "Form Address": result["form_data_address"],
                                    "Document Address": result["document_address"],
                                    "Document Hash": document_hash,
                                    "Encryption Key": password
                                }
                            }, (err) => {
                                if (err) throw err;
                                res.render('kyc_corporate_upload_record', { data: recorded_data });
                            });
    
                        }
                        else {
                            // flash is used to display the flash message in the view page.
                            req.flash('error_msg', 'Error occured while uploading form data to Blockchain');
                            res.redirect('/user/kyc_corporate_upload_record');
                        }
                    });
                } else {
                    req.flash('error_msg', "Please upload a file");
                    res.redirect('/user/kyc_corporate_upload_record');
                }
            });
        } catch (error) {
            console.log("Error", error);
            // flash is used to display the flash message in the view page.
            req.flash('error_msg', 'Error occured while uploading form data to Blockchain');
            res.redirect('/user/kyc_corporate_upload_record');
        }
    }
}