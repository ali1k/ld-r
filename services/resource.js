'use strict';
import {sparqlEndpoint} from '../configs/general';
import {defaultGraphName, resourceFocusType} from '../configs/reactor';
import ResourceQuery from './sparql/ResourceQuery';
import ResourceUtil from './utils/ResourceUtil';
import rp from 'request-promise';
/*-------------config-------------*/
const httpOptions = {
  host: sparqlEndpoint[0].host,
  port: sparqlEndpoint[0].port,
  path: sparqlEndpoint[0].path
};
const outputFormat = 'application/sparql-results+json';
/*-----------------------------------*/
let rpPath, graphName, resourceURI, query, queryObject, utilObject;
queryObject = new ResourceQuery();
utilObject = new ResourceUtil();

export default {
    name: 'resource',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'resource.properties') {
            //SPARQL QUERY
            graphName = params.dataset;
            resourceURI = params.resource;
            query = queryObject.getProperties(graphName, resourceURI);
            // console.log(query);
            //build http uri
            rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    resourceURI: resourceURI,
                    properties: utilObject.parseProperties(res, params.category)
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, resourceURI: resourceURI, properties: []});
            });
        }

    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
