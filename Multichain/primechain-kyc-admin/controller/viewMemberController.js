const dataStorage = require("../BlockchainLib/storage");
const async = require("async");
const config = require("../configs/blockchain_config");

module.exports = {
    get_view_members_page: (req, res, next) => {
        try {
            // Querying the liststreamitems api to retrive all the member records and display in view page.
            dataStorage.listStreamKeys(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], (err, result) => {
                if (err) { return next(err); }
                // Checks if the result is true and its length.
                if (result && result.length) {
                    let members = [];
                    // We are iterating each result with async function call.
                    async.forEach(result, function (item, callback) {
                        // Querying to blockchain to get data fo the members.
                        dataStorage.getMostRecentStreamDatumForKey(config["STREAMS"]["KYC_MEMBER_MASTERLIST_STREAM"], item["key"], (err, data) => {
                            if (err) callback(err);
                            if (data["status"] === "active") {

                                members.push({ name: data["member_name"], email: data["member_email"], public_address: data["member_public_address"], member_api_url: data["member_api_url"] });

                                callback();
                            }
                            else {
                                callback();
                            }
                        });
                        // This function will handle the callback of async.
                    }, function (err) {
                        if (err) { return next(err); }
                        res.render('view_members', { members: members });
                    });
                }
                else {
                    // If the result is null it will render the view members view page
                    res.render('view_members');
                }
            });
        }
        catch (error) {
            req.flash("error_msg", "Internal server error occured");
            res.redirect("/user/view_members");
        }
    },
}