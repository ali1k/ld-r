'use strict';
var rp = require('request-promise');
var config = require('../../configs/general');
var reactorConfig = require('../../configs/reactor');
var httpOptions = {
  host: config.sparqlEndpoint[0].host,
  port: config.sparqlEndpoint[0].port,
  path: config.sparqlEndpoint[0].path
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
      PREFIX risis: <http://risis.eu/> \
      PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
      SELECT ?p ?o FROM <'+ reactorConfig.authGraphName[0] +'> WHERE { \
        { \
            <'+id+'> a foaf:Person . \
            <'+id+'> ?p ?o . \
        } \
      } \
      ';
      var rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
      //send request
      rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(res){
          var parsed = JSON.parse(res);
          var user={};
          user.editorOfGraph=[];
          user.editorOfResource=[];
          if(parsed.results.bindings.length){
            parsed.results.bindings.forEach(function(el) {
                if(self.getPropertyLabel(el.p.value)==='editorOfGraph'){
                    user.editorOfGraph.push(el.o.value);
                }else{
                    if(self.getPropertyLabel(el.p.value)==='editorOfResource'){
                        user.editorOfResource.push(el.o.value);
                    }else{
                        user[self.getPropertyLabel(el.p.value)] = el.o.value;
                    }
                }
            });
            //to not show password in session
            delete user.password;
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
      PREFIX risis: <http://risis.eu/> \
      PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
      SELECT ?s ?p ?o FROM <'+ reactorConfig.authGraphName[0] +'> WHERE { \
        { \
            ?s a foaf:Person . \
            ?s foaf:accountName "'+ username +'" .\
            ?s ?p ?o . \
        } \
      } \
      ';
      var rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
      //send request
      rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(res){
          var parsed = JSON.parse(res);
          var user={};
          user.editorOfGraph=[];
          user.editorOfResource=[];
          if(parsed.results.bindings.length){
            parsed.results.bindings.forEach(function(el) {
                if(self.getPropertyLabel(el.p.value)==='editorOfGraph'){
                    user.editorOfGraph.push(el.o.value);
                }else{
                    if(self.getPropertyLabel(el.p.value)==='editorOfResource'){
                        user.editorOfResource.push(el.o.value);
                    }else{
                        user[self.getPropertyLabel(el.p.value)] = el.o.value;
                    }
                }
            });
            user.id = parsed.results.bindings[0].s.value;
            // console.log(user);
            //success login
            return fn(null, user);
          }
      }).catch(function (err) {
          console.log(err);
          return fn(null, null);
      });
  }
};
