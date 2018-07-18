const router = require('express').Router();
const Handlebars = require('handlebars');
const common_utility = require('../lib/common_utility');
const dashboardController = require("../controller/dashboardController");
const kycUploadController = require('../controller/kycUploadController');
const kycMyUploadedController = require('../controller/kycMyUploadedController');
const kycSearchController = require('../controller/kycSearchController');
const kycManageWhiteListController = require('../controller/kycManageWhiteListController');
const downloadDocumentController = require('../controller/downloadController');
const changePasswordController = require('../controller/changePasswordController');
const verifyUserController = require('../controller/verifyUserController');
const logoutController = require('../controller/logoutController');

// Customized handlebar for displaying link in the UI.
Handlebars.registerHelper('displayLink', function (v1, options) {
    if (v1 === 'y') {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Initializing of then navigation menu 
let navMenus = [{
    "category": "Dashboard",
    "category_link": "/user/dashboard",
    "category_icon": "dashboard",
    "roles": null
},
{
    "category": "Corporate KYC",
    "category_link": "",
    "category_icon": "file",
    "roles": [{
        "role_code": "/user/kyc_corporate_upload_record",
        "role_title": "Upload Records",
        "role_display": "y",
        "role_icon": ""
    },
    {
        "role_code": "/user/kyc_corporate_search_record",
        "role_title": "Search Records",
        "role_display": "y",
        "role_icon": ""
    },
    {
        "role_code": "/user/kyc_corporate_my_uploaded_records",
        "role_title": "My Uploaded Records",
        "role_display": "y",
        "role_icon": ""
    }]
},
{
    "category": "Manage Whitelists",
    "category_link": "/user/kyc_corporate_manage_whitelist",
    "category_icon": "users",
    "roles": null
}];

router.use(function (req, res, next) {
    res.locals.user = req.user || null;
    res.locals.menus = navMenus;
    res.locals.title = getRoleTitle(req.originalUrl);
    next();
});

// This function is called to display the role code, when user succesfully login in dashboard.
function getRoleTitle(role_code) {
    var title = null;

    for (var i = 0, j = navMenus.length; i < j; i++) {
        if (navMenus[i]["roles"]) {
            for (var x = 0, y = navMenus[i]["roles"].length; x < y; x++) {
                if (navMenus[i]["roles"][x]["role_code"] == role_code) {
                    title = navMenus[i]["roles"][x]["role_title"];
                    break;
                }
            }
        }
        else if (navMenus[i]["category_link"] == role_code) {
            title = navMenus[i]["category"];
            break;
        }
    }
    return title;
}

router.get('/verify_user', common_utility.isLoggedIn, verifyUserController.get_verify_an_user);

// Get Dashboard    
router.get('/dashboard', common_utility.isLoggedIn, dashboardController.get_dashbaord_page);

// Logout
router.get('/logout', common_utility.isLoggedIn, logoutController.get_logout_page);

//Corporate kyc upload controller starts here.
router.get('/kyc_corporate_upload_record', common_utility.isLoggedIn, kycUploadController.get_kyc_corporate_upload_page);

router.post('/get_document_categories', common_utility.isLoggedIn, kycUploadController.get_document_categories_list);

router.post('/kyc_corporate_upload_record', common_utility.isLoggedIn, kycUploadController.post_kyc_corporate_upload_record);

router.get('/kyc_corporate_my_uploaded_records', common_utility.isLoggedIn, kycMyUploadedController.get_my_uploaded_records);

router.get('/kyc_corporate_search_record', common_utility.isLoggedIn, kycSearchController.get_search_record_page);

router.post('/kyc_corporate_search_record', common_utility.isLoggedIn, kycSearchController.post_search_record);

router.get('/kyc_corporate_manage_whitelist', common_utility.isLoggedIn, kycManageWhiteListController.get_whitelist_page);

router.post('/kyc_corporate_save_whitelist', common_utility.isLoggedIn, kycManageWhiteListController.post_whitelist);

router.post('/download_document', common_utility.isLoggedIn, downloadDocumentController.download_document);

router.get('/change_password', common_utility.isLoggedIn, changePasswordController.get_change_password_page);

router.post('/change_password', common_utility.isLoggedIn, changePasswordController.post_change_password);


module.exports = router;