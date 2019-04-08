const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/user');
const Comment = require('../models/comments');
const commentlist = require('../models/commentList');
const passwordRecovery = require('../models/passwordRecovery');
const auth = require('../config/auth');
const request = require('request');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt-nodejs');

//Error
function MyCustomError(customInfo)
{
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = "error:" + customInfo;
}

//Captcha Middleware
function captcha (req,res, next) {
    try {
        const Secret = auth.reCaptcha.secretKey;
        let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
        recaptcha_url += "secret=" + Secret + "&";
        recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
        recaptcha_url += "remoteip=" + req.connection.remoteAddress;
        request(recaptcha_url, function (error, resp, body) {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                res.send('Droid detected. We don\'t serve your kind here. You\'ll have to wait outside.');
            } else {
                next();
            }
        })
    } catch(e){
        return next(new MyCustomError('Loading Failed:'));
    }
}

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
        try {
            let login;
            if (req.user) {
                login = true;
                res.render('index', {
                    title: 'Remarked On!',
                    loginState: login,
                    login: login,
                    message: '',
                    user: req.user
                });
            } else {
                login = false;
                res.render('index', {title: 'Remarked On!', loginState: login, login: login, message: ''});

            }
        }catch(e){
            return next(new MyCustomError('Something went wrong...'));

        }

    });

    router.get('/login', function (req, res, next) {
        try {
            res.render('solo_login', {title: 'Log in', message: req.flash('loginMessage')});
        } catch(e){
            return next(new MyCustomError('Loading Failed:'));
        }
    });
                /////////LOCAL LOGIN////////////////////
    router.post('/login',
        function (req,res,next) {
        try {
            passport.authenticate('local-login', {
                successRedirect: '/',
                failureRedirect: '/login',
                failureFlash: false,
            })(req, res, next);
        }
        catch(err){
            res.redirect('back');
        }
        });



    //////////////////////Local Auth////////////////////////////////
    router.get('/signup',  function (req, res, next) {
        res.render('solo_signup', {title: 'Sign Up', message: req.flash('signupMessage')});
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


    ///////////////////Password Reset ////////////////////////
    //~~~~~~submit email~~~~~~~~//
router.post('/forgotpassword', function (req, res, next) {
    let token;
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                 token = buf.toString('hex');
                done(err, token);
            });
        },

        function(token, done) {

            User.findOneAndUpdate({ 'user.local.email': req.body.email },
                {$set:{'resetPasswordToken':token,'resetPasswordExpires': Date.now() + 3600000}}, {new: false},
            ).exec(function(err, user) {
                    if (!user) {
                        res.send('User not found');
                    }
                done(err, token, user);
                }
            )
        },

        function(token, user, done) {
            const emailPW = '9rhFJJh=tAcFht$!';
            const smtpTransport = nodemailer.createTransport("smtps://remarkedon%40gmail.com:"+encodeURIComponent(emailPW) + "@smtp.gmail.com:465");
            const mailOptions = {
                to: req.body.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('info', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
                done(err, 'done');
            });
        }

    ], function(err) {
        if (err) return next(err);
        res.send('Check your email and follow the link.');
    });
});

    //~~~~~~~~~~~ reset password route
router.get('/reset/:token', function(req, res) {
    // User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    //     if (!user) {
    //         req.flash('error', 'Password reset token is invalid or has expired.');
    //         return res.redirect('/');
    //     }
        res.render('reset', {title: 'Forgot Password?', token: req.params.token
        });
   // });
});

//~~~~~~~~~~~~~~ send new password
router.post('/reset/:token', function(req, res) {

    try {
        async.waterfall([
            function (done) {
                if (req.body.password !== req.body.password_conf) {
                    return res.send('Passwords didn\'t match. Try again ');
                }
                const newPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);

                User.findOneAndUpdate({resetPasswordToken: req.params.token/*, resetPasswordExpires: { $gt: Date.now() }*/},
                    {$set: {'user.local.password': newPassword, 'resetPasswordToken': "", 'resetPasswordExpires': ""}},
                    {new: true})
                    .exec(function (err, user) {
                        if (!user) {
                            req.flash('error', 'Password reset token is invalid or has expired.');
                            return res.redirect('back');
                        } else {
                            done(err, user);
                        }

                    });
            },
            function (user, done) {
                console.log(JSON.stringify(user));
                const emailPW = '9rhFJJh=tAcFht$!';
                const smtpTransport = nodemailer.createTransport("smtps://remarkedon%40gmail.com:" + encodeURIComponent(emailPW) + "@smtp.gmail.com:465");
                var mailOptions = {
                    to: user.user.local.email,
                    from: 'remarkedon@gmail.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.user.local.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash('success', 'Success! Your password has been changed.');
                    if (err) {
                        return res.send('Try again');
                    }
                    else {
                        return res.redirect('/');
                    }
                });
            }
        ])
    } catch(e){
        return next(new MyCustomError('Loading Failed:'));
    }
});



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
    try {
    let url = encodeURIComponent(req.params.url);
    let login;
    if (req.user) {
        login = true;
    } else {
        login = false;
    }

    Comment.findOne({url}).exec(function (err, result) {
        if (err) {
            res.render('comments', {title: 'Comments', user: req.user, url: "Hmmm...", login: login});

        } else {
            res.render('comments', {title: 'Comments', user: req.user, url: url, comments: result, login: login});
        }
    });
} catch(e){
        return next(new MyCustomError('Loading Failed:'));
    }
});

router.get('/find/webUrl/:web', function (req,res,next) {
    try {
    let login;
    if (req.user) {
        login = true;
    } else {
        login = false;
    }
    ///checks for url
    urlRegEx = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;
    let webUrl = req.query.webUrl;
    const strippedWebUrl = webUrl.replace(/https:\/\/|http:\/\/|:|www.|/gi, '');

    if (urlRegEx.test(strippedWebUrl)) {
        commentlist.find({url: "https:\/\/www." + strippedWebUrl.toString()}).populate({path: 'user'}).exec(function (err, result) {
            if (err) {
                res.render('comments', {
                    title: 'Couldn\'t get all the comments...',
                    user: req.user,
                    url: webUrl,
                    comments: "none",
                    login: login
                });
            } else if (result === null) {
                res.render('comments', {
                    title: 'Comments',
                    user: req.user,
                    url: strippedWebUrl,
                    comments: null,
                    login: login
                });
            } else {
                res.render('comments', {
                    title: 'Comments',
                    user: req.user,
                    url: strippedWebUrl,
                    comments: result,
                    login: login
                });
            }
        });
    } else {
        let login;
        if (req.user) {
            login = true;
            res.render('index', {title: 'Not a URL', loginState: login, message: '', login: login, user: req.user});
        } else {
            login = false;
            res.render('index', {
                title: 'Not a URL. Also, you should sign-up ;)',
                loginState: login,
                login: login,
                message: ''
            });

        }
    }
} catch(e){
        return next(new MyCustomError('Loading Failed:'));
    }
});




router.post('/submit/:url',isLoggedIn, captcha, function (req,res,next) {
try {
    let url = req.params.url;
    let webUrl = url;
    const strippedWebUrl = webUrl.replace(/https:\/\/|http:\/\/|:|www.|/gi, '');
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
            Comment.findOneAndUpdate({'url': fullURL}, {$inc: {count: 1}}, {upsert: true}).exec(),
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
} catch(e){
    return next(new MyCustomError('Loading Failed:'));
}
});


router.get('/mycomments', isLoggedIn, function (req,res,next) {
try {
    let login;
    if (req.user) {
        login = true;
    } else {
        login = false;
    }

    let id = req.user._id;

    User.find({_id: id}).populate('comment').exec(function (err, result) {
        if (err) {
            res.render('error', {title: 'OOPS!', message: err});

        } else if (result === null) {
            res.render('error', {title: 'OOPS!', message: err});
        } else {
            res.render('mycomments', {title: 'My Comments', user: req.user, comments: result, login: login});
        }
    });
} catch(e){
    return next(new MyCustomError('Loading Failed:'));
}
});

router.get('/privacy-policy', function (req,res, nest) {
    res.render('facebook_privacy');
});



module.exports = [router,express];
