'use strict';
let rp = require('request-promise');
let config = require('../../configs/server');
let generalConfig = require('../../configs/general');
let helpers = require('../../services/utils/helpers');

let httpOptions;
let d = generalConfig.authDatasetURI[0],
    g = generalConfig.authDatasetURI[0];
httpOptions = helpers.getHTTPOptions(d);
let dg = helpers.prepareDG(d);
d = dg.d;
g = dg.g;
let authGraphName = g;
httpOptions = {
    host: config.sparqlEndpoint[d].host,
    port: config.sparqlEndpoint[d].port,
    path: config.sparqlEndpoint[d].path
};

let outputFormat = 'application/sparql-results+json';
//this is visible to the server-side
module.exports = {
    getPropertyLabel: function(uri) {
        let property = '';
        let tmp = uri;
        let tmp2 = tmp.split('#');
        if (tmp2.length > 1) {
            property = tmp2[1];
        } else {
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
        }
        return property;
    },
    findById: function(id, fn) {
        let self = this;
        /*jshint multistr: true */
        let query = '\
      PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#> \
      PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
      SELECT ?p ?o ?pr ?pp FROM <' + generalConfig.authDatasetURI[0] + '> WHERE { \
        { \
            <' + id + '> a foaf:Person . \
            <' + id + '> ?p ?o . \
            OPTIONAL {?o ldr:resource ?pr . ?o ldr:property ?pp .} \
        } \
      } \
      ';
        //send request
        let endpoint = helpers.getEndpointParameters([generalConfig.authDatasetURI[0]]);
        let rpPath = helpers.getHTTPGetURL(helpers.getHTTPQuery('read', query, endpoint, outputFormat));
        rp.get({
            uri: rpPath
        }).then(function(res) {
            let parsed = JSON.parse(res);
            let user = {};
            user.editorOfGraph = [];
            user.editorOfResource = [];
            user.editorOfProperty = [];
            if (parsed.results.bindings.length) {
                parsed.results.bindings.forEach(function(el) {
                    if (self.getPropertyLabel(el.p.value) === 'editorOfGraph') {
                        user.editorOfGraph.push(el.o.value);
                    } else {
                        if (self.getPropertyLabel(el.p.value) === 'editorOfResource') {
                            user.editorOfResource.push(el.o.value);
                        } else {
                            if (self.getPropertyLabel(el.p.value) === 'editorOfProperty') {
                                if (el.pp && el.pr) {
                                    user.editorOfProperty.push({
                                        p: el.pp.value,
                                        r: el.pr.value
                                    })
                                }
                            } else {
                                user[self.getPropertyLabel(el.p.value)] = el.o.value;
                            }
                        }
                    }
                });
                //to not show password in session
                delete user.password;
                user.graphName = generalConfig.authDatasetURI[0];
                user.id = id;
                return fn(null, user);
            }
        }).catch(function(err) {
            console.log(err);
            return fn(null, null);
        });
    },
    findByUsername: function(username, fn) {
        let self = this;
        /*jshint multistr: true */
        let query = '\
      PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#> \
      PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
      SELECT ?s ?p ?o FROM <' + generalConfig.authDatasetURI[0] + '> WHERE { \
        { \
            ?s a foaf:Person . \
            ?s foaf:accountName "' + username + '" .\
            ?s ?p ?o . \
        } \
      } \
      ';
        let endpoint = helpers.getEndpointParameters([generalConfig.authDatasetURI[0]]);
        let rpPath = helpers.getHTTPGetURL(helpers.getHTTPQuery('read', query, endpoint, outputFormat));
        //send request
        rp.get({
            uri: rpPath
        }).then(function(res) {
            let parsed = JSON.parse(res);
            let user = {};
            if (parsed.results.bindings.length) {
                parsed.results.bindings.forEach(function(el) {
                    user[self.getPropertyLabel(el.p.value)] = el.o.value;
                });
                user.id = parsed.results.bindings[0].s.value;
                // console.log(user);
                return fn(null, user);
            }
        }).catch(function(err) {
            console.log(err);
            return fn(null, null);
        });
    }
};
