'use strict';
import {dbpediaLookupService, dbpediaSpotlightService} from '../configs/server';
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
                console.log('\n dbpedia.lookup \n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                callback(null, {suggestions: []});
            });
        /////////////////////////////////////////////
        } else if (resource === 'dbpedia.coordinates') {
            let rpPath, uris = params.uris;
            query = queryObject.getPrefixes() + queryObject.getCoordinates(uris);
            // console.log(query);
            rpPath = DBpediaLiveEndpoint + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            rp.get({uri: rpPath}).then(function(res){
                callback(null, {coordinates: utilObject.parseDBpediaCoordinates(res), property: params.property});
            }).catch(function () {
                //last chance: try DBpedia live endpoint!
                rpPath = DBpediaEndpoint + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
                rp.get({uri: rpPath}).then(function(res){
                    callback(null, {coordinates: utilObject.parseDBpediaCoordinates(res), property: params.property});
                }).catch(function (err) {
                    console.log(err);
                    callback(null, {coordinates: [], property: ''});
                });
            });
            /////////////////////////////////////////////
        } else if (resource === 'dbpedia.spotlight') {
            query = params.query;
            //handle confidence and stopWords
            let confidence = params.confidence ? params.confidence : '0.5';
            let stopWords = params.stopWords;
            //handle empty text
            if(!query || !query.trim()){
                callback(null, {
                    tags: [],
                    id: params.id,
                    query: params.query
                });
                return 0;
            }else{
                //send request
                rp.post({headers: {'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded'}, accept: 'application/json', uri: 'http://' + dbpediaSpotlightService[0].host + ':' + dbpediaSpotlightService[0].port + dbpediaSpotlightService[0].path, form: {'text': query, 'confidence': confidence}}).then(function(res){
                    callback(null, {
                        tags: utilObject.parseDBpediaSpotlight(res, stopWords),
                        id: params.id,
                        query: params.query
                    });
                }).catch(function (err) {
                    console.log('\n dbpedia.spotlight \n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                    callback(null, {tags: [], id: params.id, query: params.query, error: 'spotlight service'});
                });
            }

        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
