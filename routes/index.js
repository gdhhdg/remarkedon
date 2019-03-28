const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/user');
const Comment = require('../models/comments');
const commentlist = require('../models/commentList');
const auth = require('../config/auth');
const request = require('request');


//Captcha Middleware
function captcha (req,res, next) {
    const Secret = auth.reCaptcha.secretKey;
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + Secret + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;
    request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            res.send('Droid detected. We don\'t serve your kind here. You\'ll have to wait outside.');
        } else {
            next();
        }
    })}

                /////////GOOGLE AUTHORIZE////////////////////
    router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));

    router.get('/auth/google/callback', passport.authenticate('google',{
        successRedirect:'/',
        failureRedirect:'/login'
    }));

            /////////GOOGLE CONNECT////////////////////
    router.get('/connect/google',passport.authorize('google',{
        scope:['profile','email',]
    }));
    router.get('/connect/google/callback', passport.authorize('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));



                /////////FACEBOOK AUTHORIZE////////////////////
    router.get('/auth/facebook', passport.authenticate('facebook',
        {scope:['public_profile','email']}
        ));

    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect:'/login',
    }));
    ///////////////////FACEBOOK CONNECT /////////////////////////
   router.get('/connect/facebook',passport.authorize('facebook',{
       scope:['public_profile','email']
   }));
   router.get('/connect/facebook/callback', passport.authorize('facebook', {
       successRedirect: '/',
       failureRedirect: '/login'
   }));

    // /////////////////Twitter Route////////////////////////
    // router.get('/auth/twitter',passport.authenticate('twitter'));
    //
    // router.get('/auth/twitter/callback', passport.authenticate('twitter',{
    //     successRedirect:'/profile',
    //     failureRedirect:'/login'
    // }));

            //////////////////////HOME /////////////////////////
    router.get('/', function (req, res, next) {
        let login;
        if (req.user){
            login = true;
            res.render('index', {title: 'Search', loginState: login, message: '', user: req.user});
        } else {
            login = false;
            res.render('index', {title: 'Search', loginState: login, message: ''});

        }

    });

    router.get('/login', function (req, res, next) {
        res.render('login', {title: 'login', message: req.flash('loginMessage')});
    });
                /////////LOCAL LOGIN////////////////////
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    }));

    //////////////////////Local Auth////////////////////////////////
    router.get('/signup',  function (req, res, next) {
        res.render('signup', {title: 'signup', message: req.flash('signupMessage')});
    });

    router.post('/signup', captcha, passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    //////////////////////local connect//////////////////
    router.get('/connect/local', function (req,res) {
        res.render('connect-local',{title: "Local Login", message:req.flash('loginMessage')});
    });

    router.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect:'/login',
        failureFlash: true
    }));

            ///////////////////REMOVE ACCOUNTS////////////////////

    router.get('/remove/facebook', function (req,res) {
        let user = req.user;
        user.facebook.userID = undefined;
        user.facebook.password = undefined;
        user.facebook.name = undefined;
        user.facebook.id = undefined;
        user.facebook.token = undefined;
        user.save(function (err) {
            if(err)
                throw err;
            res.redirect('/profile');
        });

    });

router.get('/remove/google', function (req,res) {
    let user = req.user;
    user.google.id = undefined;
    user.google.password = undefined;
    user.google.name = undefined;
    user.google.token = undefined;
    user.save(function (err) {
        if(err)
            throw err;
        res.redirect('/profile');
    });

});

    router.get('/remove/local', function (req,res) {
            let user = req.user;
            user.local.email = undefined;
            user.local.password = undefined;
            user.save(function (err) {
                if(err)
                    throw err;
                res.redirect('/profile');
            })
    });

//////PROFILE
router.get('/profile', isLoggedIn, function (req, res, next) {

        res.render('profile', {title: 'Profile', user: req.user, login: true});
    });

    router.get('/logout', function (req, res, next) {
        req.logout();
        res.redirect('back');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/');

};


    ///////////////////C O M M E N T S  R O U T E S\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
router.get('/comments/:url', function (req,res,next) {
    let url = encodeURIComponent(req.params.url);
    let login;
    if (req.user){
        login = true;
    } else {
        login = false;
    }

    Comment.findOne({url}).exec( function (err, result) {
        if (err) {
            res.render('comments', {title: 'Comments', user: req.user, url: "Hmmm...", login:login});

        } else {
            console.log(result);
            res.render('comments', {title: 'Comments', user: req.user, url: url, comments: result, login:login});
        }
    });
});

router.get('/find/webUrl/:web', function (req,res,next) {

    let login;
    if (req.user){
        login = true;
    } else {
        login = false;
    }
    ///checks for url
    urlRegEx = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;
    let webUrl = req.query.webUrl;
    const strippedWebUrl = webUrl.replace(/https:\/\/|http:\/\/|:|www.|/gi , '');

    if(urlRegEx.test(strippedWebUrl)){
    commentlist.find({url:"https:\/\/www." + strippedWebUrl.toString()}).populate({path:'user'}).exec( function (err, result) {
        if (err) {
            res.render('comments', {title: 'Couldn\'t get all the comments...', user: req.user, url: webUrl, comments: "none",login:login});
        } else if (result === null) {
            res.render('comments', {title: 'Comments', user: req.user, url: strippedWebUrl, comments: null, login:login});
        }else {
            res.render('comments', {title: 'Comments', user: req.user, url: strippedWebUrl, comments: result, login:login});
        }
    });
} else {
        let login;
        if (req.user){
            login = true;
            res.render('index', {title: 'Not a URL', loginState: login, message: '', user: req.user});
        } else {
            login = false;
            res.render('index', {title: 'Not a URL. Also, you should sign-up ;)', loginState: login, message: ''});

        }
    }
});




router.post('/submit/:url',isLoggedIn, captcha, function (req,res,next) {

    let url = req.params.url;
    let webUrl = url;
    const strippedWebUrl = webUrl.replace(/https:\/\/|http:\/\/|:|www.|/gi , '');
    const fullURL = "https:\/\/www." + strippedWebUrl.toString();
    const id = mongoose.Types.ObjectId();
    let newDoc = new commentlist({
        _id: id,
        user: req.user._id,
        comment: req.body.comment,
        url: fullURL
    });
    newDoc.save(function () {
        Promise.all([
            Comment.findOneAndUpdate({'url': fullURL}, {$push: {comment: newDoc}}, {upsert: true}).exec(),
            Comment.findOneAndUpdate({'url': fullURL}, {$inc:{count:1}}, {upsert: true}).exec(),
            User.findByIdAndUpdate(req.user._id, {$push: {'comment': id}}).exec()
        ])
            .then(function (err) {
                if (err) {
                    res.redirect('back');
                } else {
                    res.redirect('back');
                }
            });
            });
});


router.get('/mycomments', isLoggedIn, function (req,res,next) {

    let login;
    if (req.user){
        login = true;
    } else {
        login = false;
    }

    let id = req.user._id;

    User.find({_id: id}).populate('comment').exec( function (err, result) {
        if (err) {
            res.render('error',{ title:'OOPS!', message: err});

        } else if (result === null) {
            res.render('error',{ title:'OOPS!', message: err});
        }else {
            console.log('results:',result);
            res.render('mycomments', {title: 'My Comments', user: req.user, comments: result, login:login});
        }
    });
});



module.exports = [router,express];
