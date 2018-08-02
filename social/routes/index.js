const express = require('express');
const router = express.Router();
const passport = require('passport');




  /* GET home page. */
    router.get('/', function (req, res, next) {
        res.render('index', {title: 'Home', message: ''});
    });

    router.get('/login', function (req, res, next) {
        res.render('login', {title: 'login', message: req.flash('loginMessage')});
    });

    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true,
    }));

    router.get('/signup', function (req, res, next) {
        res.render('signup', {title: 'signup', message: req.flash('signupMessage')});
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    router.get('/profile', isLoggedIn, function (req, res, next) {
        res.render('profile', {title: 'Profile', user: req.user});
    });

    router.get('/logout', function (req, res, next) {
        req.logout();
        res.redirect('/login');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/');

};
module.exports = [router,express];
