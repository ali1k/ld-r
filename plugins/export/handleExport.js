'use strict';
var rp = require('request-promise');
var generalConfig = require('../../configs/general');
var helper = require('../authentication/auth-helper')

var appShortTitle = generalConfig.appShortTitle;
var appFullTitle = generalConfig.appFullTitle;

var exportResource = function(format, graphName, resourceURI, req, res) {
    var endpoint = helper.getEndpointParameters([graphName]);
    var httpOptions= endpoint.httpOptions;
    var useDefaultGraph = endpoint.useDefaultGraph;
    var outputFormat;
    switch (format) {
        case 'RDF/XML':
            outputFormat = 'application/rdf+xml';
            break;
        case 'JSON':
            outputFormat = 'application/sparql-results+json';
            break;
        case 'NTriples':
            outputFormat = 'text/plain';
            break;
        default:
            outputFormat = 'text/plain';
    }
    var ext = 'FROM <'+graphName+'>';
    if(useDefaultGraph){
        ext = '';
    }
    var primaryTopic = '<http://'+req.headers.host+'/dataset/'+encodeURIComponent(graphName)+'> foaf:primaryTopic <'+graphName+'> . ?s ?p ?o .';
    var selectPhrase = '?s ?p ?o .';
    if(resourceURI){
        selectPhrase = '<'+resourceURI+'> ?p ?o . OPTIONAL {?o ?sp ?spo .} FILTER(?p != ldReactor:password)';
        primaryTopic = '<http://'+req.headers.host+'/dataset/'+encodeURIComponent(graphName)+'/resource/'+encodeURIComponent(resourceURI)+'> foaf:primaryTopic <'+resourceURI+'> . <'+resourceURI+'> ?p ?o . ?o ?sp ?spo .';
    }
    /*jshint multistr: true */
    var query = '\
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
    PREFIX ldReactor: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#> \
    CONSTRUCT {'+primaryTopic+'} '+ext+' WHERE { ' + selectPhrase + ' } LIMIT 70000 \
    ';
    var rpPath = helper.getHTTPQuery('read', query, endpoint, outputFormat);
    rp.get({uri: rpPath}).then(function(result){
        res.set({
          'Content-Type': outputFormat,
          'Content-Length': result.length
      });
        //res.download(result);
        res.write(result);
        res.end();
        //res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
    /* todo: content negotiation
    res.format({
      'text/plain': function(){

      },
      'text/html': function(){
          res.render('export', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data: 'data', errorMsg: ''});
      },
      'application/json': function(){

      },
      'default': function() {
        // log the request and respond with 406

      }
    });
    */
}
module.exports = function handleExport(server) {
    server.get('/export/:t/:g/:r?', function(req, res) {
        var format = req.params.t;
        var graphName = req.params.g;
        var resourceURI = req.params.r;
        if(generalConfig.enableAuthentication){
            if(!req.isAuthenticated()){
                res.render('export', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data:'', errorMsg: 'Permission denied! Please login to system to access the page...'});
            }else{
                if(resourceURI){
                    exportResource(format, graphName, resourceURI, req, res);
                }else{
                    //only super users can export in batch mode
                    if(req.user.isSuperUser === '1'){
                        exportResource(format, graphName, resourceURI, req, res);
                    }else{
                        res.render('export', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data:'', errorMsg: 'Permission denied! You do not have enough permission to access the page...'});
                    }
                }
            }
        }else{
            exportResource(format, graphName, resourceURI, req, res);
        }
    });
};
