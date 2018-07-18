const async = require('async');
const dataStorage = require('../BlockchainLib/storage');
const config = require('../configs/blockchain_config');
const whitelistModel = require('../model/whitelist');

module.exports = {
    get_whitelist_page: (req, res, next) => {
        try {
            // Querying data from the blockchain
            dataStorage.listStreamKeys(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], (err, members_list) => {
                if (err) { return next(err); }

                if (members_list && members_list.length) {
                    let members = [];

                    // iterating items with an async call
                    async.forEach(members_list, (item, callback) => {
                        dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], item["key"], (err, member_data) => {
                            if (err) { return next(err); }

                            if (member_data) {
                                if (member_data["member_public_address"] == req.user.user_address) {
                                    callback();
                                }
                                else {
                                    // Retrieving the records from the private database.
                                    whitelistModel.getMemberDetailsByAddress(member_data["member_public_address"], (err, member_details) => {
                                        if (err) { return callback(err, null); }

                                        members.push({ name: member_data["member_name"], email: member_data["member_email"], public_address: member_data["member_public_address"], isWhiteListed: (member_details != null) });

                                        callback();
                                    });
                                }
                            }
                            else {
                                callback();
                            }
                        });
                    }, (err) => {
                        if (err) { return next(err); }

                        res.render('kyc_corporate_manage_whitelist', { members: members });
                    });
                }
                else {
                    // If any error happens it will redirected to view page with an error message.
                    req.flash("error_msg", "Unable to retrive records from the blockchain.");
                    res.redirect('/user/kyc_corporate_manage_whitelist');
                }
            });
        }
        catch (error) {
            req.flash("error_msg", "Unable to retrive records from the blockchain.");
            res.redirect('/user/kyc_corporate_manage_whitelist');
        }
    },

    post_whitelist: (req, res, next) => {
        try {
            let isRemove = req.body.isWhiteListed;

            if (isRemove && isRemove == "true") {
                // deleting record from the database.
                whitelistModel.deleteMemberByAddress(req.body.public_address, (err, is_deleted) => {
                    if (err) { return next(err); }

                    if (is_deleted) {
                        req.flash("error_msg", `Successfully removed ${req.body.member_name} from whitelist`);
                        res.redirect("/user/kyc_corporate_manage_whitelist");
                    }
                    else {
                        req.flash("error_msg", `Unable to remove ${req.body.member_name} from whitelist`);
                        res.redirect("/user/kyc_corporate_manage_whitelist");
                    }

                });
            }
            else {
                // Parameters is passed to whitelist model to save user details in database.
                let newwhiteList = new whitelistModel({
                    email: req.body.email,
                    public_address: req.body.public_address,
                    member_name: req.body.member_name
                });

                whitelistModel.add(newwhiteList, (err, is_whitelisted) => {
                    if (err) { return next(err); }

                    if (is_whitelisted) {
                        req.flash("success_msg", `Successfully added ${req.body.member_name} to whitelist`);
                        res.redirect('/user/kyc_corporate_manage_whitelist');
                    }
                    else {
                        // flash is used to display flash message in the view page
                        req.flash("error_msg", `Unable to add ${req.body.member_name} to whitelist`);
                        res.redirect('/user/kyc_corporate_manage_whitelist');
                    }

                });
            }
        } catch (error) {
            req.flash("error_msg", "Unable to retrive records from the blockchain.");
            res.redirect('/user/kyc_corporate_manage_whitelist');
        }
    }
}