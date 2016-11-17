'use strict';
let rp = require('request-promise');
let generalConfig = require('../../configs/general');
let helpers = require('../../services/utils/helpers');
let helpers2 = require('../../services/utils/dynamicHelpers');
let appShortTitle = generalConfig.appShortTitle;
let appFullTitle = generalConfig.appFullTitle;

let exportResource = function(format, datasetURI, resourceURI, req, res) {
    helpers2.getDynamicEndpointParameters(req.user, [datasetURI], (endpoint) => {
        let httpOptions = endpoint.httpOptions;
        let outputFormat;
        switch (format.toLowerCase()) {
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
        if(endpoint.type === 'cliopatria'){
            outputFormat = 'rdf+xml';
        }
        let {gStart, gEnd} = helpers.prepareGraphName(endpoint.graphName);
        let primaryTopic = '<http://' + req.headers.host + '/dataset/' + encodeURIComponent(datasetURI) + '> foaf:primaryTopic <' + datasetURI + '> . ?s ?p ?o .';
        let selectPhrase = '?s ?p ?o .';
        if (resourceURI) {
            selectPhrase = '<' + resourceURI + '> ?p ?o . OPTIONAL {?o ?sp ?spo .} FILTER(?p != ldr:password)';
            primaryTopic = '<http://' + req.headers.host + '/dataset/' + encodeURIComponent(datasetURI) + '/resource/' + encodeURIComponent(resourceURI) + '> foaf:primaryTopic <' + resourceURI + '> . <' + resourceURI + '> ?p ?o . ?o ?sp ?spo .';
        }
        let query = `
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            CONSTRUCT {${primaryTopic}}  WHERE {
                ${gStart}
                    ${selectPhrase}
                ${gEnd}
            } LIMIT 70000
        `;
        //console.log(query);
        let rpPath = helpers.getHTTPGetURL(helpers.getHTTPQuery('read', query, endpoint, outputFormat));
        rp.get({
            uri: rpPath
        }).then(function(result) {
            res.set({
                'Content-Type': outputFormat,
                'Content-Length': result.length
            });
            //res.download(result);
            res.write(result);
            res.end();
            //res.send(result);
        }).catch(function(err) {
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
    });
}
module.exports = function handleExport(server) {
    server.get('/export/:t/:d/:r?', function(req, res) {
        let format = req.params.t;
        let datasetURI = req.params.d;
        let resourceURI = req.params.r;
        if (generalConfig.enableAuthentication) {
            if (!req.isAuthenticated()) {
                res.render('export', {
                    appShortTitle: appShortTitle,
                    appFullTitle: appFullTitle,
                    data: '',
                    errorMsg: 'Permission denied! Please login to system to access the page...'
                });
            } else {
                if (resourceURI) {
                    exportResource(format, datasetURI, resourceURI, req, res);
                } else {
                    //only super users can export in batch mode
                    if (req.user.isSuperUser === '1') {
                        exportResource(format, datasetURI, resourceURI, req, res);
                    } else {
                        res.render('export', {
                            appShortTitle: appShortTitle,
                            appFullTitle: appFullTitle,
                            data: '',
                            errorMsg: 'Permission denied! You do not have enough permission to access the page...'
                        });
                    }
                }
            }
        } else {
            exportResource(format, datasetURI, resourceURI, req, res);
        }
    });
};
