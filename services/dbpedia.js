'use strict';
var endpoints = require('../configs/general').dbpediaLookupService;
var rp = require('request-promise');
var utils = require('./utils/dbpedia_utils');
var query;
module.exports = {
  name: 'dbpedia',
  read: function(req, resource, params, config, callback) {
      if (resource === 'dbpedia.lookup') {
          query = params.query;
          //send request
          rp({method: 'get', headers: {'Accept': 'application/json'}, accept: 'application/json', uri: 'http://'+endpoints[0].host+'/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=5&QueryString='+ query}).then(function(res){
              callback(null, {
                  suggestions: utils.parseDBpediaLookup(res)
              });
          }).catch(function (err) {
              console.log('\n Status Code: \n'+err.statusCode+'\n Error Msg: \n'+err.message);
              callback(null, {suggestions: []});
          });
      /////////////////////////////////////////////
      } else if (resource === 'dbpedia.annotate') {
          console.log('ToDo!');
        /////////////////////////////////////////////
      }
  }

};
