
const LocalStrategy   = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
const User       		= require('../models/user');
const configAuth      = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // Google LOGIN =============================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true

    }, function (req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            if(!req.user){
                User.findOne({'google.id': profile.id}, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user);
                } else {
                    let newUser = new User();
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value;

                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    })

                }
            })
        } else {
                var user = req.user;
                user.google.id = profile.id;
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value;

                user.save(function (err) {
                    if(err)
                        throw err;
                    return done(null,user);
                });
            } });
    }));


    // =========================================================================
    // Twitter LOGIN =============================================================
    // =========================================================================
    passport.use(new TwitterStrategy({
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret:configAuth.twitterAuth.consumerSecret,
        callbackURL:configAuth.twitterAuth.callbackURL
    },
        function (token, tokenSecret, profile, done) {
            process.nextTick(function () {
                User.findOne({'twitter.id':profile.id},function (err,user) {
                    if (err)
                        return done(err);
                    if(user) {
                        return done (null, user);
                    } else {
                        const newUser = new User();
                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err){
                            if (err)
                                throw err;
                            return done(null,newUser);
                        });

                    }

                });
            });
        }));




    // =========================================================================
    // FACEBOOK LOGIN =============================================================
    // =========================================================================

    passport.use(new FacebookStrategy({

        clientID : configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        passReqToCallback: true
    },
        function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                if(!req.user){

                    User.findOne({
                    'facebook.id': profile.id
                }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        console.log('profile is: ', JSON.stringify(profile));
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.userID = profile.userID;
                        newUser.facebook.name = profile.displayName;
                        // newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function (err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }
                });
            } else {
                    var user = req.user;
                    user.facebook.id = profile.id;
                    user.facebook. token = token;
                    user.facebook.name = profile.displayName;
                    user.facebook.userID = profile.userID;

                    user.save(function (err) {
                        if(err)
                            throw err;
                        return done(null, user);
                    })
                }
            });
        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField:'email',
           // emailField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {

                    User.findOne({'local.username': req.body.username},function (err,user) {
                        if (err)
                            return done(err);
                        if(user){
                            return done(null,false,req.flash('signupMessage','That username is already taken'));
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser            = new User();

                            // set the user's local credentials
                            newUser.local.email    = email;
                            newUser.local.username = req.body.username;
                            newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

                            // save the user
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                }

            });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
           // var criteria = (username.indexOf('@') === -1) ? {'local.email': email} : {'local.email': username};
            User.findOne({'local.email': email}, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

        }));

};