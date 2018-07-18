module.exports = {
    get_logout_page: (req, res) => {
        req.logout();
        req.flash('success_msg', 'See you soon...');
        res.redirect('/');
    }
}