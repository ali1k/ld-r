'use strict';
import {sparqlEndpoint} from '../configs/general';
import {defaultGraphName, resourceFocusType, enableAuthentication, maxNumberOfResourcesOnPage} from '../configs/reactor';
import DatasetQuery from './sparql/DatasetQuery';
import DatasetUtil from './utils/DatasetUtil';
import rp from 'request-promise';
/*-------------config-------------*/
const httpOptions = {
  host: sparqlEndpoint[0].host,
  port: sparqlEndpoint[0].port,
  path: sparqlEndpoint[0].path
};
const outputFormat = 'application/sparql-results+json';
let user;
/*-----------------------------------*/
let rpPath, graphName, query, queryObject, utilObject, propertyURI;
queryObject = new DatasetQuery();
utilObject = new DatasetUtil();

export default {
    name: 'dataset',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'dataset.resourcesByType') {
            let offset = (params.page - 1) * maxNumberOfResourcesOnPage;
            //SPARQL QUERY
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName);
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, resourceFocusType: resourceFocusType, resources: [], page: params.page});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getResourcesByType(graphName, resourceFocusType, maxNumberOfResourcesOnPage, offset);
            //build http uri
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    resourceFocusType: resourceFocusType,
                    resources: utilObject.parseResourcesByType(res, graphName),
                    page: params.page
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, resourceFocusType: resourceFocusType, resources: [], page: params.page});
            });
        } else if (resource === 'dataset.countResourcesByType') {
            //SPARQL QUERY
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName);
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {total: 0});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.countResourcesByType(graphName, resourceFocusType);
            //build http uri
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                callback(null, {
                    total: utilObject.parseCountResourcesByType(res)
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {total: 0});
            });
        } else if (resource === 'dataset.facets') {
            //SPARQL QUERY
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName);
           //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, facets: {}, total: 0, page: 1});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
               //load the facets based on user selection
            if(!params.selection){
                //initial load
                callback(null, {graphName: graphName, facets: {}, total: 0, page: 1});
            }else{
                //user click
                if(parseInt(params.selection.level) === 1){
                    //master facets
                    propertyURI = decodeURIComponent(params.selection.value);
                    query = queryObject.getMasterPropertyValues(graphName, propertyURI);
                    rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
                    //send request
                    rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                        callback(null, {
                            graphName: graphName,
                            page: 1,
                            facets: utilObject.parseMasterPropertyValues(res, Boolean(params.selection.status), parseInt(params.selection.level), propertyURI, params.selection.value),
                            total: 0
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {graphName: graphName, facets: {}, total: 0, page: 1});
                    });
                }else{
                   //level 2
                    propertyURI = decodeURIComponent(params.selection.propertyURI);
                    query = queryObject.countSecondLevelPropertyValues(graphName, propertyURI, params.selection.prevSelection);
                   //console.log(query);
                    rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
                   //send request
                    rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                        let query2 = queryObject.getSecondLevelPropertyValues(graphName, propertyURI, params.selection.prevSelection, params.page);
                        //console.log(query2);
                        let rpPath2 = httpOptions.path + '?query=' + encodeURIComponent(query2) + '&format=' + encodeURIComponent(outputFormat);
                        rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath2}).then(function(res2){
                           callback(null, {
                               graphName: graphName,
                               page: params.page,
                               facets: utilObject.parseSecondLevelPropertyValues(graphName, res2, Boolean(params.selection.status), parseInt(params.selection.level), propertyURI, params.selection.value),
                               total: utilObject.parseCountResourcesByType(res)
                           });
                       }).catch(function (err2) {
                           console.log(err2);
                           callback(null, {graphName: graphName, facets: {}, total: 0, page: 1});
                       });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {graphName: graphName, facets: {}, total: 0, page: 1});
                    });
                }
            }
        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
