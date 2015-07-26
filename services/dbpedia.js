'use strict';
import {dbpediaLookupService} from '../configs/server';
import rp from 'request-promise';
import DBpediaUtil from './utils/DBpediaUtil';
import DBpediaQuery from './sparql/DBpediaQuery';
const DBpediaEndpoint = 'http://dbpedia.org/sparql';
const DBpediaLiveEndpoint = 'http://live.dbpedia.org/sparql';
const outputFormat = 'application/sparql-results+json';
let query, lookupClass = '';
let utilObject = new DBpediaUtil();
let queryObject = new DBpediaQuery();

export default {
    // Name is the resource. Required.
    name: 'dbpedia',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'dbpedia.lookup') {
            query = params.query;
            lookupClass = params.lookupClass ? params.lookupClass : '';
            //send request
            rp({method: 'get', headers: {'Accept': 'application/json'}, accept: 'application/json', uri: 'http://' + dbpediaLookupService[0].host + '/api/search.asmx/PrefixSearch?QueryClass=' + lookupClass + '&MaxHits=5&QueryString=' + query}).then(function(res){
                callback(null, {
                    suggestions: utilObject.parseDBpediaLookup(res)
                });
            }).catch(function (err) {
                console.log('\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                callback(null, {suggestions: []});
            });
        /////////////////////////////////////////////
        } else if (resource === 'dbpedia.coordinates') {
            let rpPath, uris = params.uris;
            query = queryObject.getPrefixes() + queryObject.getCoordinates(uris);
            // console.log(query);
            rpPath = DBpediaLiveEndpoint + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            rp.get({uri: rpPath}).then(function(res){
                callback(null, {coordinates: utilObject.parseDBpediaCoordinates(res)});
            }).catch(function () {
                //last chance: try DBpedia live endpoint!
                rpPath = DBpediaEndpoint + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
                rp.get({uri: rpPath}).then(function(res){
                    callback(null, {coordinates: utilObject.parseDBpediaCoordinates(res)});
                }).catch(function (err) {
                    console.log(err);
                    callback(null, {coordinates: []});
                });
            });
          /////////////////////////////////////////////
        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
