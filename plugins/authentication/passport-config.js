'use strict';
//this is visible to the server-side
var authentication=require('./auth');
var LocalStrategy = require('passport-local').Strategy;
var passwordHash = require('password-hash');
module.exports = {

  enable: function(passport){
    // Passport session setup.
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      authentication.findById(id, function (err, user) {
        done(err, user);
      });
    });
    // Use the LocalStrategy within Passport.
    //   Strategies in passport require a `verify` function, which accept
    //   credentials (in this case, a username and password), and invoke a callback
    //   with a user object.This could also query a database;
    //   however, in this project we are using a baked-in set of users.
    passport.use(new LocalStrategy(
      function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
          // Find the user by username.  If there is no user with the given
          // username, or the password is not correct, set the user to `false` to
          // indicate failure and set a flash message.  Otherwise, return the
          // authenticated `user`.

          authentication.findByUsername(username, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
            if (!passwordHash.verify(password, user.password)) { return done(null, false, { message: 'Invalid password' }); }
            if(user.isActive!=='1'){
                console.log('User is not activated!');
                return done(null, false, {message: 'User is not activated!'});
            }
            //empty password when passed to client
            user.password='';
            //success login
            return done(null, user);
          });
        });
      }
    ));
  },

};
