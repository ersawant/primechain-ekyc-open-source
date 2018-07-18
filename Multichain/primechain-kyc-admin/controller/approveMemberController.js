const async = require('async');
const dataStorage = require('../BlockchainLib/storage');
const config = require('../configs/blockchain_config');
const common_utility = require('../lib/common_utility');

module.exports = {
    get_approve_member_page: (req, res, next) => {
        try {
            var has_to_approve = [];
            dataStorage.listStreamKeys(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], (err, keys) => {
                if (err) { return next(err); }

                async.forEach(keys, (key, callback) => {
                    if (err) { return next(err); }

                    if (key) {
                        dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], key["key"], (err, member_data) => {
                            if (err) { return next(err); }

                            if (member_data["status"] === "pending") {
                                has_to_approve.push({ "name": member_data["member_name"], "email": member_data["member_email"], "cin": member_data["member_cin"], "public_address": member_data["member_public_address"] });

                                callback();
                            }
                            else {
                                callback();
                            }
                        });
                    }
                    else {
                        callback();
                    }
                }, (err) => {
                    if (err) { return next(err); }

                    res.render("approve_member", { "member_records": has_to_approve });
                });
            });
        } catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/user/approve_member');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/user/approve_member');
            }
        }
    },

    post_approve_a_member: (req, res, next) => {
        try {
            dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], req.body.publisher_address, (err, member_details) => {
                if (err) { return next(err); }

                let form_data = member_details;
                delete form_data.status;
                form_data.status = "active";

                dataStorage.grant(form_data["member_public_address"], "send,receive", (err, callback) => {
                    if (err) { return next(err); }

                    // Granting permissions to write the stream
                    dataStorage.grant(form_data["member_public_address"], config["STREAMS"]["KYC_DATA_STREAM"] + ".write", (err, result) => {
                        if (err) { return next(err); }

                        // Granting permissions to write the stream
                        dataStorage.grant(form_data["member_public_address"], config["STREAMS"]["KYC_RECORD_STREAM"] + ".write", (err, result) => {
                            if (err) { return next(err); }

                            // Granting permissions to write the stream
                            dataStorage.grant(form_data["member_public_address"], config["STREAMS"]["KYC_OTHER_STREAM"] + ".write", (err, result) => {
                                if (err) { return next(err); }

                                // Granting permissions to write the stream
                                dataStorage.grant(form_data["member_public_address"], config["STREAMS"]["KYC_SIGNATURE_STREAM"] + ".write", (err, result) => {
                                    if (err) { return next(err); }

                                    dataStorage.publishDataToBlockchain(req.user.user_address, config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], req.body.publisher_address, common_utility.json2hex(form_data), (err, success) => {
                                        if (err) { return next(err); }

                                        if (success) {
                                            req.flash("success_msg", "Member approved successfully");
                                            res.redirect("/user/approve_member");
                                        }
                                        else {
                                            req.flash("error_msg", "Unable to approve a member, please try after sometime");
                                            res.redirect("/user/approve_member");
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
        catch (error) {
            if (error instanceof ReferenceError) {
                req.flash('error_msg', ReferenceError.prototype.name);
                res.redirect('/user/approve_member');
            }
            else {
                req.flash('error_msg', error);
                res.redirect('/user/approve_member');
            }
        }
    }
}