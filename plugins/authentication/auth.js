'use strict';
let rp = require('request-promise');
let config = require('../../configs/server');
let generalConfig = require('../../configs/general');
let helpers = require('../../services/utils/helpers');
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
        let endpoint = helpers.getStaticEndpointParameters([generalConfig.authDatasetURI[0]]);
        let {gStart, gEnd} = helpers.prepareGraphName(endpoint.graphName);
        let query = `
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            SELECT ?p ?o ?pp ?oo WHERE {
                ${gStart}
                    <${id}> a ldr:User ; ?p ?o .
                    OPTIONAL {?o ?pp ?oo .}
                ${gEnd}
            }
        `;
        //send request
        let rpPath = helpers.getHTTPGetURL(helpers.getHTTPQuery('read', query, endpoint, outputFormat));
        rp.get({
            uri: rpPath
        }).then(function(res) {
            let parsed = JSON.parse(res);
            let user = {};
            user.editorOf = [];
            user.member = [];
            let editorObj ={};
            user.viewerOf = [];
            let viewerObj ={};
            if (parsed.results.bindings.length) {
                parsed.results.bindings.forEach(function(el) {
                    if (self.getPropertyLabel(el.p.value) === 'editorOf') {
                        if (el.o && el.pp && el.oo) {
                            if(!editorObj[el.o.value]){
                                editorObj[el.o.value]= {};
                            }
                            editorObj[el.o.value][self.getPropertyLabel(el.pp.value)] = el.oo.value;
                        }
                    } else if (self.getPropertyLabel(el.p.value) === 'viewerOf') {
                        if (el.o && el.pp && el.oo) {
                            if(!viewerObj[el.o.value]){
                                viewerObj[el.o.value]= {};
                            }
                            viewerObj[el.o.value][self.getPropertyLabel(el.pp.value)] = el.oo.value;
                        }
                    } else if (self.getPropertyLabel(el.p.value) === 'member') {
                        //array of membership
                        user.member.push(el.o.value);
                    } else {
                        user[self.getPropertyLabel(el.p.value)] = el.o.value;
                    }
                });
                for(let prop in editorObj){
                    user.editorOf.push(editorObj[prop]);
                }
                for(let prop in viewerObj){
                    user.viewerOf.push(viewerObj[prop]);
                }
                //to not show password in session
                delete user.password;
                user.datasetURI = generalConfig.authDatasetURI[0];
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
        let endpoint = helpers.getStaticEndpointParameters([generalConfig.authDatasetURI[0]]);
        let {gStart, gEnd} = helpers.prepareGraphName(endpoint.graphName);
        let query = `
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            SELECT ?s ?p ?o WHERE {
                ${gStart}
                    ?s a ldr:User ;
                       foaf:accountName "${username}" ;
                       ?p ?o .
                ${gEnd}
            }
        `;
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
