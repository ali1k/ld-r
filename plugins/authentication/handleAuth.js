'use strict';
//required for authentication
let passwordHash = require('password-hash');
let passport = require ('passport');
let passportConfig = require('./passport-config');
passportConfig.enable(passport);
//----------------------
let handleEmail = require('../../plugins/email/handleEmail');
let rp = require('request-promise');
let config = require('../../configs/server');
let generalConfig = require('../../configs/general');
let helpers = require('../../services/utils/helpers');

let appShortTitle = generalConfig.appShortTitle;
let appFullTitle = generalConfig.appFullTitle;

let outputFormat = 'application/sparql-results+json';
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
        res.redirect('/dataset/' + encodeURIComponent(generalConfig.authDatasetURI)+'/resource/'+ encodeURIComponent(req.params.id));
    });
    server.get('/confirmation', function(req, res) {
        if(!req.isAuthenticated()){
            res.render('confirmation', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, needsConfirmation: generalConfig.enableUserConfirmation});
        }else{
            return res.redirect('/');
        }
    });
    server.get('/register', function(req, res) {
        let recaptchaSiteKey = '';
        if(generalConfig.useGoogleRecaptcha && config.googleRecaptchaService){
            recaptchaSiteKey = config.googleRecaptchaService.siteKey[0];
        }
        if(!req.isAuthenticated()){
            res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, recaptchaSiteKey: recaptchaSiteKey});
        }else{
            return res.redirect('/');
        }
    });
     server.post('/register', function(req, res, next) {
         let recaptchaSiteKey = '';
         let recaptchaSecretKey = '';
         if(generalConfig.useGoogleRecaptcha && config.googleRecaptchaService){
             recaptchaSiteKey = config.googleRecaptchaService.siteKey[0];
             recaptchaSecretKey = config.googleRecaptchaService.secretKey[0];
         }

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
             res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, recaptchaSiteKey: recaptchaSiteKey, data: req.body, errorMsg: 'Error... '+error});
         }else{
             //successfull
             //check recaptcha if enabled
             if(recaptchaSiteKey){
                 let recaptchaValidationURL = 'https://www.google.com/recaptcha/api/siteverify';
                 let recpostOptions = {
                     method: 'POST',
                     uri: recaptchaValidationURL + '?secret='+recaptchaSecretKey + '&response=' + encodeURIComponent(req.body['g-recaptcha-response'])
                 };
                 rp(recpostOptions).then(function(recres){
                     let recapRes = JSON.parse(recres);
                     //console.log(recapRes);
                     if(recapRes.success !== undefined && !recapRes.success){
                         //error in recaptcha validation
                         res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, recaptchaSiteKey: recaptchaSiteKey, data: req.body, errorMsg: 'Error... Captcha is not validated! You seem to be a robot...'});
                         return 0;
                     }else{
                         addUserQueries(req, res, recaptchaSiteKey);
                     }
                 }).catch(function (errRecap) {
                     console.log(errRecap);
                 });
             }else{
                 addUserQueries(req, res, recaptchaSiteKey);
             }

         }
     });
};
let prepareGraphName = (graphName)=> {
    let gStart = 'GRAPH <'+ graphName +'> { ';
    let gEnd = ' } ';
    if(!graphName || graphName === 'default'){
        gStart =' ';
        gEnd = ' ';
    }
    return {gStart: gStart, gEnd: gEnd}
};
let addUserQueries = (req, res, recaptchaSiteKey) => {
    //first check if user already exists
    let endpoint = helpers.getStaticEndpointParameters([generalConfig.authDatasetURI[0]]);
    let {gStart, gEnd} = helpers.prepareGraphName(endpoint.graphName);
    let query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
    SELECT ( COUNT(?s) AS ?exists ) WHERE {
      ${gStart}
          ?s a ldr:User .
          ?s foaf:accountName """${req.body.username}""" .
      ${gEnd}
    }
    `;
    let rpPath = helpers.getHTTPGetURL(helpers.getHTTPQuery('read', query, endpoint, outputFormat));
    //send request
    rp.get({uri: rpPath}).then(function(resq){
        let parsed = JSON.parse(resq);
        if(parsed.results.bindings.length){
            if(parsed.results.bindings[0].exists.value ==='0'){
                //register as new user
                console.log('start registration');
                let rnd = Math.round(+new Date() / 1000);
                let resourceURI = generalConfig.baseResourceDomain + '/user/' + rnd;
                let dresourceURI = generalConfig.baseResourceDomain + '/resource/' + rnd;
                let datasetURI = generalConfig.baseResourceDomain + '/dataset/' + rnd;
                let blanknode = generalConfig.baseResourceDomain + '/editorship/' + rnd;
                let tmpE= [];
                let isActive = generalConfig.enableUserConfirmation? 0 : 1;
                let date = new Date();
                let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
                query = `
                    PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                    PREFIX dcterms: <http://purl.org/dc/terms/>
                    INSERT DATA  {
                        ${gStart}
                            <${resourceURI}> a foaf:Person , ldr:User ;
                                             foaf:firstName """${req.body.firstname}""";
                                             foaf:lastName """${req.body.lastname}""";
                                             foaf:organization """${req.body.organization}""";
                                             foaf:accountName """${req.body.username}""";
                                             foaf:member ldr:NormalUser ;
                                             foaf:mbox <mailto:${req.body.email}>;
                                             dcterms:created "${currentDate}"^^xsd:dateTime;
                                             ldr:password """${passwordHash.generate(req.body.password)}""";
                                             ldr:isActive "${isActive}"^^xsd:Integer;
                                             ldr:isSuperUser "0"^^xsd:Integer;
                                             ldr:editorOfDataset <${datasetURI}>;
                                             ldr:editorOfResource <${dresourceURI}>;
                                             ldr:editorOfProperty <${blanknode}1>, <${blanknode}2>, <${blanknode}3>, <${blanknode}4> .
                                             <${blanknode}1> ldr:resource <${resourceURI}> ;
                                                             ldr:property foaf:firstName .
                                             <${blanknode}2> ldr:resource <${resourceURI}> ;
                                                             ldr:property foaf:lastName .
                                             <${blanknode}3> ldr:resource <${resourceURI}> ;
                                                             ldr:property foaf:organization .
                                             <${blanknode}4> ldr:resource <${resourceURI}> ;
                                                             ldr:property ldr:password .

                        ${gEnd}
                    }
                `;
                let HTTPQueryObject = helpers.getHTTPQuery('update', query, endpoint, outputFormat);
                rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(){
                    console.log('User is created!');
                    //send email notifications
                    if(generalConfig.enableEmailNotifications){
                        handleEmail.sendMail('userRegistration', req.body.email, '', '', '', '');
                    }
                    return res.redirect('/confirmation');
                }).catch(function (err2) {
                    console.log(err2);
                });
            }else{
                res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, recaptchaSiteKey: recaptchaSiteKey, data: req.body, errorMsg: 'Error... User already exists!'});
                console.log('User already exists!');
            }

        }else{
            res.render('register', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, recaptchaSiteKey: recaptchaSiteKey, data: req.body, errorMsg: 'Error... Unknown Error!'});
        }
    }).catch(function (errq) {
        console.log(errq);
    });
}
