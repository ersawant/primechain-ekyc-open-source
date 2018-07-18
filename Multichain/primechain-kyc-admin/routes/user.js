const router = require('express').Router();
const Handlebars = require('handlebars');
const common_utility = require('../lib/common_utility');
const approveMemberController = require('../controller/approveMemberController');
const viewMemberController = require('../controller/viewMemberController');
const changePasswordController = require('../controller/changePasswordController');
const dashboardController = require('../controller/dashboardController');
const logoutController = require('../controller/logoutController');

Handlebars.registerHelper('displayLink', function (v1, options) {
    if (v1 === 'y') {
        return options.fn(this);
    }
    return options.inverse(this);
});

let navMenus = [{
    "role_code": "/user/dashboard",
    "role_title": "Dashboard",
    "role_display": "y",
    "role_icon": "dashboard"
},
{
    "role_code": "/user/approve_member",
    "role_title": "Approve Member",
    "role_display": "y",
    "role_icon": "user"
},
{
    "role_code": "/user/view_members",
    "role_title": " View Members",
    "role_display": "y",
    "role_icon": "users"
}];

router.use(function (req, res, next) {
    res.locals.user = req.user || null;
    res.locals.menus = navMenus;
    res.locals.title = getRoleTitle(req.originalUrl);
    next();
});

function getRoleTitle(role_code) {
    var title = null;

    for (var i = 0, j = navMenus.length; i < j; i++) {
        if (navMenus[i]["role_code"] == role_code) {
            title = navMenus[i]["role_title"];
            break;
        }
    }
    return title;
}
// Get Dashboard    
router.get('/dashboard', common_utility.isLoggedIn, dashboardController.get_dashbaord_page);

// Get Members masterlist page
router.get('/approve_member', common_utility.isLoggedIn, approveMemberController.get_approve_member_page);

router.post('/approve_a_member', common_utility.isLoggedIn, approveMemberController.post_approve_a_member);

// View all members
router.get('/view_members', common_utility.isLoggedIn, viewMemberController.get_view_members_page);

// Change password
router.get('/change_password', common_utility.isLoggedIn, changePasswordController.get_change_password_page);

router.post('/change_password', common_utility.isLoggedIn, changePasswordController.post_change_password);

// Logout
router.get('/logout', common_utility.isLoggedIn, logoutController.get_logout_page)


module.exports = router;