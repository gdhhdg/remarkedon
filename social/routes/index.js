const express = require('express');
const router = express.Router();
const passport = require('passport');


                /////////Google Routes////////////////////
    router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));

    router.get('/auth/google/callback', passport.authenticate('google',{
        successRedirect:'/profile',
        failureRedirect:'/login'
    }));

    //auth
    router.get('/connect/google',passport.authorize('google',{
        scope:['profile','email']
    }));
    router.get('/connect/google/callback', passport.authorize('google', {
        successRedirect: '/profile',
        failureRedirect: '/login'
    }));



                /////////Facebook Routes////////////////////
    router.get('/auth/facebook', passport.authenticate('facebook',
        {scope:['public_profile','email']}
        ));

    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect:'/login',
    }));
    //Authorize
   router.get('/connect/facebook',passport.authorize('facebook',{
       scope:['public_profile','email']
   }));
   router.get('/connect/facebook/callback', passport.authorize('facebook', {
       successRedirect: '/profile',
       failureRedirect: '/login'
   }));

    /////////////////Twitter Route////////////////////////
    router.get('/auth/twitter',passport.authenticate('twitter'));

    router.get('/auth/twitter/callback', passport.authenticate('twitter',{
        successRedirect:'/profile',
        failureRedirect:'/login'
    }));

            //////////////////////home Route/////////////////////////
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

    //////////////////////Local Auth////////////////////////////////
    router.get('/signup', function (req, res, next) {
        res.render('signup', {title: 'signup', message: req.flash('signupMessage')});
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    //local connect
    router.get('/connect/local', function (req,res) {
        res.render('connect-local',{message:req.flash('loginMessage')});
    });

    router.post('/connect/local', passport.authorize('local-signup', {
        successRedirect: '/profile',
        failureRedirect:'/login',
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
