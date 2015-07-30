'use strict';
var rp = require('request-promise');
var config = require('../../configs/server');
var generalConfig = require('../../configs/general');
var helper = require('./auth-helper')
var httpOptions, g;
if(config.sparqlEndpoint[generalConfig.authGraphName[0]]){
    g = generalConfig.authGraphName[0];
}else{
    //go for generic SPARQL endpoint
    g = 'generic';
}
httpOptions = {
  host: config.sparqlEndpoint[g].host,
  port: config.sparqlEndpoint[g].port,
  path: config.sparqlEndpoint[g].path
};
var outputFormat = 'application/sparql-results+json';
//this is visible to the server-side
module.exports = {
    getPropertyLabel: function(uri) {
        var property='';
        var tmp=uri;
        var tmp2=tmp.split('#');
        if(tmp2.length>1){
            property=tmp2[1];
        }else{
            tmp2=tmp.split('/');
            property=tmp2[tmp2.length-1];
        }
        return property;
    },
  findById: function(id, fn){
      var self=this;
      /*jshint multistr: true */
      var query = '\
      PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#> \
      PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
      SELECT ?p ?o ?pr ?pp FROM <'+ generalConfig.authGraphName[0] +'> WHERE { \
        { \
            <'+id+'> a foaf:Person . \
            <'+id+'> ?p ?o . \
            OPTIONAL {?o ldr:resource ?pr . ?o ldr:property ?pp .} \
        } \
      } \
      ';
      //send request
      var endpoint = helper.getEndpointParameters([generalConfig.authGraphName[0]]);
      var rpPath = helper.getHTTPQuery('read', query, endpoint, outputFormat);
      rp.get({uri: rpPath}).then(function(res){
          var parsed = JSON.parse(res);
          var user={};
          user.editorOfGraph=[];
          user.editorOfResource=[];
          user.editorOfProperty=[];
          if(parsed.results.bindings.length){
            parsed.results.bindings.forEach(function(el) {
                if(self.getPropertyLabel(el.p.value)==='editorOfGraph'){
                    user.editorOfGraph.push(el.o.value);
                }else{
                    if(self.getPropertyLabel(el.p.value)==='editorOfResource'){
                        user.editorOfResource.push(el.o.value);
                    }else{
                        if(self.getPropertyLabel(el.p.value)==='editorOfProperty'){
                            if(el.pp && el.pr){
                                user.editorOfProperty.push({p: el.pp.value,r: el.pr.value})
                            }
                        }else{
                            user[self.getPropertyLabel(el.p.value)] = el.o.value;
                        }
                    }
                }
            });
            //to not show password in session
            delete user.password;
            user.graphName = generalConfig.authGraphName[0];
            user.id = id;
            return fn(null, user);
          }
      }).catch(function (err) {
          console.log(err);
          return fn(null, null);
      });
  },
  findByUsername: function(username, fn){
      var self=this;
      /*jshint multistr: true */
      var query = '\
      PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#> \
      PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
      SELECT ?s ?p ?o FROM <'+ generalConfig.authGraphName[0] +'> WHERE { \
        { \
            ?s a foaf:Person . \
            ?s foaf:accountName "'+ username +'" .\
            ?s ?p ?o . \
        } \
      } \
      ';
      var endpoint = helper.getEndpointParameters([generalConfig.authGraphName[0]]);
      var rpPath = helper.getHTTPQuery('read', query, endpoint, outputFormat);
      //send request
      rp.get({uri: rpPath}).then(function(res){
          var parsed = JSON.parse(res);
          var user={};
          if(parsed.results.bindings.length){
            parsed.results.bindings.forEach(function(el) {
                user[self.getPropertyLabel(el.p.value)] = el.o.value;
            });
            user.id = parsed.results.bindings[0].s.value;
            // console.log(user);
            return fn(null, user);
          }
      }).catch(function (err) {
          console.log(err);
          return fn(null, null);
      });
  }
};
