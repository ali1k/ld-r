'use strict';
var rp = require('request-promise');
var config = require('../../configs/general');
var reactorConfig = require('../../configs/reactor');
var httpOptions = {
  host: config.sparqlEndpoint[0].host,
  port: config.sparqlEndpoint[0].port,
  path: config.sparqlEndpoint[0].path
};
var appShortTitle = config.appShortTitle;
var appFullTitle = config.appFullTitle;
var exportResource = function(format, graphName, resourceURI, req, res) {
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
    /*jshint multistr: true */
    var query = '\
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
    CONSTRUCT {<http://'+req.headers.host+'/dataset/'+encodeURIComponent(graphName)+'/resource/'+encodeURIComponent(resourceURI)+'> foaf:primaryTopic <'+resourceURI+'> . ?s ?p ?o . ?o ?sp ?spo .} FROM <'+graphName+'> WHERE { \
    <'+resourceURI+'> ?p ?o . \
    ?s ?p ?o .\
    OPTIONAL {?o ?sp ?spo .}\
    } \
    ';
    var rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
    rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(result){
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
    server.get('/export/:t/:g/:r', function(req, res) {
        var format = req.params.t;
        var graphName = req.params.g;
        var resourceURI = req.params.r;
        if(reactorConfig.enableAuthentication){
            if(!req.isAuthenticated()){
                res.render('export', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, data:'', errorMsg: 'Permission denied! Please login to system to access the page...'});
            }else{
                exportResource(format, graphName, resourceURI, req, res);
            }
        }else{
            exportResource(format, graphName, resourceURI, req, res);
        }
    });
};
