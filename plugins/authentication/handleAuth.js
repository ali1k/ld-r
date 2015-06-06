'use strict';
//required for authentication
var passwordHash = require('password-hash');
var passport = require ('passport');
var passportConfig = require('./passport-config');
passportConfig.enable(passport);
//----------------------
var handleEmail = require('../../plugins/email/handleEmail');
var rp = require('request-promise');
var config = require('../../configs/general');
var reactorConfig = require('../../configs/reactor');
var httpOptions, g;
if(config.sparqlEndpoint[reactorConfig.authGraphName[0]]){
    g = reactorConfig.authGraphName[0];
}else{
    //go for generic SPARQL endpoint
    g = 'generic';
}
httpOptions = {
  host: config.sparqlEndpoint[g].host,
  port: config.sparqlEndpoint[g].port,
  path: config.sparqlEndpoint[g].path
};
var appShortTitle = config.appShortTitle;
var appFullTitle = config.appFullTitle;

var outputFormat = 'application/sparql-results+json';
module.exports = function handleAuthentication(server) {
    server.use(passport.initialize());
    server.use(passport.session());
    server.get('/login', function(req, res) {
        if(!req.isAuthenticated()){
            res.render('login', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, user: req.user });
        }else{
            return res.redirect('/');
        }
     });
    server.post('/login', function(req, res, next) {
        let redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
        delete req.session.redirectTo;
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) {
                console.log('auth failed! ' + info.message);
                res.render('login', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data: req.body, errorMsg: 'Authentication failed... ' + info.message});
            }else{
                req.logIn(user, function(err2) {
                    if (err2) { return next(err2); }
                    // console.log('auth is OK!');
                    return res.redirect(redirectTo);
                });
            }
        })(req, res, next);
    });
    server.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    server.get('/profile/:id', function(req, res) {
        res.redirect('/dataset/' + encodeURIComponent(reactorConfig.authGraphName)+'/resource/'+ encodeURIComponent(req.params.id));
    });
    server.get('/confirmation', function(req, res) {
        if(!req.isAuthenticated()){
            res.render('confirmation', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, needsConfirmation: reactorConfig.enableUserConfirmation});
        }else{
            return res.redirect('/');
        }
     });
    server.get('/register', function(req, res) {
        if(!req.isAuthenticated()){
            res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle});
        }else{
            return res.redirect('/');
        }
     });
     server.post('/register', function(req, res, next) {
         let error= '';
         if(req.body.password !== req.body.cpassword){
             error = 'Error! password mismatch...';
         }else{
             for (let prop in req.body) {
                 if(!req.body[prop]){
                     error = error + ' missing value for "' + prop +'"';
                 }
             }
         }
         if(error){
             console.log(error);
             res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data: req.body, errorMsg: 'Error... '+error});
         }else{
             //successfull
             //first check if user already exists
             /*jshint multistr: true */
             var query = '\
             PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
             SELECT count(?s) AS ?exists FROM <'+ reactorConfig.authGraphName[0] +'> WHERE { \
               { \
                   ?s a foaf:Person . \
                   ?s foaf:accountName "'+ req.body.username +'" .\
               } \
             } \
             ';
             var rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
             //send request
             rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(resq){
                 var parsed = JSON.parse(resq);
                 if(parsed.results.bindings.length){
                     if(parsed.results.bindings[0].exists.value ==='0'){
                         //register as new user
                         console.log('start registration');
                         var rnd = Math.round(+new Date() / 1000);
                         var resourceURI = reactorConfig.dynamicResourceDomain + '/user/' + rnd;
                         var dresourceURI = reactorConfig.dynamicResourceDomain + '/resource/' + rnd;
                         var dgraphURI = reactorConfig.dynamicResourceDomain + '/graph/' + rnd;
                         var blanknode = reactorConfig.dynamicResourceDomain + '/editorship/' + rnd;
                         var tmpE= [];
                         var isActive = reactorConfig.enableUserConfirmation? 0 : 1;
                         /*jshint multistr: true */
                         query = '\
                         PREFIX ldReactor: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#> \
                         PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
                         INSERT DATA INTO <'+ reactorConfig.authGraphName[0] +'> { \
                         <'+ resourceURI + '> a foaf:Person; foaf:firstName """'+req.body.firstname+'"""; foaf:lastName """'+req.body.lastname+'"""; foaf:organization """'+req.body.organization+'"""; foaf:mbox <'+req.body.email+'>; foaf:accountName """'+req.body.username+'"""; ldReactor:password """'+passwordHash.generate(req.body.password)+'"""; ldReactor:isActive "'+isActive+'"^^xsd:Integer; ldReactor:isSuperUser "0"^^xsd:Integer; ldReactor:editorOfGraph <'+dgraphURI+'>; ldReactor:editorOfResource <'+dresourceURI+'>; ldReactor:editorOfProperty <'+blanknode+'1>;ldReactor:editorOfProperty <'+blanknode+'2>; ldReactor:editorOfProperty <'+blanknode+'3>; ldReactor:editorOfProperty <'+blanknode+'4>.}; \
                         INSERT DATA INTO <'+ reactorConfig.authGraphName[0] +'> { \
                             <'+blanknode+'1> ldReactor:resource <'+resourceURI+'> ; ldReactor:property foaf:firstName . \
                         }; \
                         INSERT DATA INTO <'+ reactorConfig.authGraphName[0] +'> { \
                             <'+blanknode+'2> ldReactor:resource <'+resourceURI+'> ; ldReactor:property foaf:lastName . \
                         }; \
                         INSERT DATA INTO <'+ reactorConfig.authGraphName[0] +'> { \
                             <'+blanknode+'3> ldReactor:resource <'+resourceURI+'> ; ldReactor:property foaf:organization . \
                         }; \
                         INSERT DATA INTO <'+ reactorConfig.authGraphName[0] +'> { \
                             <'+blanknode+'4> ldReactor:resource <'+resourceURI+'> ; ldReactor:property ldReactor:password . \
                         }; \
                         ';
                        //  console.log(query);
                         rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);

                         rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(){
                             console.log('User is created!');
                             //send email notifications
                             if(reactorConfig.enableAuthentication){
                                 handleEmail.sendMail('userRegistration', req.body.email, '', '', '', '');
                             }
                             return res.redirect('/confirmation');
                         }).catch(function (err2) {
                             console.log(err2);
                         });
                     }else{
                         res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data: req.body, errorMsg: 'Error... User already exists!'});
                         console.log('User already exists!');
                     }

                 }else{
                     res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data: req.body, errorMsg: 'Error... Unknown Error!'});
                 }
             }).catch(function (errq) {
                 console.log(errq);
             });
         }
     });
};
