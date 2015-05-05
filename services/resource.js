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
let rpPath, category, graphName, resourceURI, objectURI, objectValue, query, queryObject, utilObject;
queryObject = new ResourceQuery();
utilObject = new ResourceUtil();

export default {
    name: 'resource',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'resource.properties') {
            category = params.category;
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
                    currentCategory: category,
                    properties: utilObject.parseProperties(res, category)
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, resourceURI: resourceURI, currentCategory: 'default', properties: []});
            });
        } else if (resource === 'resource.objectProperties') {
            graphName = params.dataset;
            objectURI = params.objectURI;
            query = queryObject.getObjectProperties(graphName, objectURI);
            rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(res){
                callback(null, {
                    objectURI: objectURI,
                    properties: utilObject.parseObjectProperties(res)
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {objectURI: objectURI, properties: []});
            });
        }

    },
    // other methods
     create: function(req, resource, params, body, config, callback) {
         if (resource === 'resource.individualObject') {
             query = queryObject.addTriple(params.dataset, params.resourceURI, params.propertyURI, params.objectValue, params.valueType);
             rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
             //send request
             rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(res){
                 callback(null, {category: params.category});
             }).catch(function (err) {
                 console.log(err);
                 callback(null, {category: params.category});
             });
         }
     },
    // update: function(req, resource, params, body, config, callback) {},
    delete: function(req, resource, params, config, callback) {
        if (resource === 'resource.individualObject') {
            query = queryObject.deleteTriple(params.dataset, params.resourceURI, params.propertyURI, params.objectValue, params.valueType);
            rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(res){
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                callback(null, {category: params.category});
            });
        }
    }
};
