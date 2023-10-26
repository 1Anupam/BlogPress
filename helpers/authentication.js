module.exports = {

    userAuthenticated: function(req, res, next){

        if (req.user && req.isAuthenticated()) {
            return next();
        }

        res.redirect('/login');

    }

};