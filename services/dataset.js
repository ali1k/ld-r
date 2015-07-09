'use strict';
import {getHTTPOptions, getEndpointType} from './utils/helpers';
import {defaultGraphName, enableAuthentication, maxNumberOfResourcesOnPage, propertiesConfig} from '../configs/reactor';
import DatasetQuery from './sparql/DatasetQuery';
import DatasetUtil from './utils/DatasetUtil';
import rp from 'request-promise';
import ldf from 'ldf-client';
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
let user;
/*-----------------------------------*/
let httpOptions, endpointType, rpPath, graphName, query, queryObject, utilObject, propertyURI, resourceFocusType;
queryObject = new DatasetQuery();
utilObject = new DatasetUtil();
let maxOnPage = maxNumberOfResourcesOnPage;
if(!maxOnPage){
    maxOnPage = 20;
}
export default {
    name: 'dataset',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'dataset.resourcesByType') {
            let offset = (params.page - 1) * maxOnPage;
            //SPARQL QUERY
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
            //check if resource focus is set
            if(graphName){
                resourceFocusType = utilObject.getResourceFocusType(propertiesConfig[graphName]);
            }else{
                if(propertiesConfig.generic.resourceFocusType){
                    resourceFocusType = propertiesConfig.generic.resourceFocusType;
                }else{
                    resourceFocusType = [];
                }
            }
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
            //build http uri
            httpOptions = getHTTPOptions(graphName);
            //check endpoint type
            endpointType = getEndpointType(graphName);
            switch (endpointType) {
                case 'Virtuoso':
                    query = queryObject.getResourcesByType(graphName, resourceFocusType, maxOnPage, offset);
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
                break;
                case 'LDF':
                    //todo: add lDF-client support for IN phrase: it won't work if you select multiple entity types now
                    query = queryObject.getResourcesByType('', resourceFocusType, maxOnPage, offset);
                    let fragmentsClient = new ldf.FragmentsClient('http://' + httpOptions.host + ':' + httpOptions.port + httpOptions.path);
                    let results = new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient });
                    let stream = [];
                    results.on('data', function(data){
                        // console.log(data);
                        stream.push(utilObject.parseResourcesByTypeFragment(data, graphName));
                        // console.log(stream);
                        callback(null, {
                            graphName: graphName,
                            resourceFocusType: resourceFocusType,
                            resources: stream,
                            page: params.page
                        });
                    });
                break;
            }
        } else if (resource === 'dataset.countResourcesByType') {
            //SPARQL QUERY
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
            if(graphName){
                resourceFocusType = utilObject.getResourceFocusType(propertiesConfig[graphName]);
            }else{
                if(propertiesConfig.generic.resourceFocusType){
                    resourceFocusType = propertiesConfig.generic.resourceFocusType;
                }else{
                    resourceFocusType = [];
                }
            }
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
            //build http uri
            httpOptions = getHTTPOptions(graphName);
            //check endpoint type
            endpointType = getEndpointType(graphName);
            switch (endpointType) {
                case 'Virtuoso':
                    query = queryObject.countResourcesByType(graphName, resourceFocusType);
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
                break;
                case 'LDF':
                    //todo: add lDF-client support for aggregate sparql queries
                    if(resourceFocusType.length >= 1){
                        let itemsC = 0;
                        resourceFocusType.forEach(function(uri) {
                            rpPath = '?predicate=' + encodeURIComponent('http://www.w3.org/1999/02/22-rdf-syntax-ns#type') + '&object=' + encodeURIComponent(uri);
                            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + httpOptions.path + rpPath, json: true}).then(function(res){
                                let items = res['@graph'][0]['@graph'];
                                itemsC = itemsC + parseInt(items[items.length - 1]['void:triples']);
                                callback(null, {
                                    total: itemsC
                                });
                            }).catch(function (err) {
                                console.log(err);
                                callback(null, {total: 0});
                            });
                        });
                    }else{
                        rpPath = '?predicate=' + encodeURIComponent('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                        rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + httpOptions.path + rpPath, json: true}).then(function(res){
                            let items = res['@graph'][0]['@graph'];
                            let itemsC = parseInt(items[items.length - 1]['void:triples']);
                            callback(null, {
                                total: itemsC
                            });
                        }).catch(function (err) {
                            console.log(err);
                            callback(null, {total: 0});
                        });
                    }
                break;
            }
            //used to update other facets based on a change in a facet
        } else if (resource === 'dataset.facetsSideEffect') {
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
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
            query = queryObject.getSideEffects(graphName, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection);
            httpOptions = getHTTPOptions(graphName);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            // console.log(query);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    page: 1,
                    facets: {propertyURI: decodeURIComponent(params.selection.propertyURI), items: utilObject.parseMasterPropertyValues(res)}
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, facets: {}, total: 0, page: 1});
            });
        //handles changes in master level facets
        } else if (resource === 'dataset.facetsMaster') {
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
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
            //do not query if unselected
            if(!Boolean(params.selection.status)){
                callback(null, {
                    graphName: graphName,
                    page: 1,
                    facets: {propertyURI: decodeURIComponent(params.selection.value), status: false}
                });
                return 0;
            }
            query = queryObject.getMasterPropertyValues(graphName, decodeURIComponent(params.selection.value));
            httpOptions = getHTTPOptions(graphName);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    page: 1,
                    facets: {status: Boolean(params.selection.status), propertyURI: decodeURIComponent(params.selection.value), items: utilObject.parseMasterPropertyValues(res)}
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, facets: {}, total: 0, page: 1});
            });
        //handles changes in second level facets
        } else if (resource === 'dataset.facetsSecondLevel') {
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
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
            if(params.mode === 'init'){
                //get all resources
                query = queryObject.countSecondLevelPropertyValues(graphName, 0, {});
            }else{
                query = queryObject.countSecondLevelPropertyValues(graphName, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection);
            }
            // console.log(query);
            httpOptions = getHTTPOptions(graphName);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                let query2 = queryObject.getSecondLevelPropertyValues(graphName, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection, maxOnPage, params.page);
                 //console.log(query2);
                let rpPath2 = httpOptions.path + '?query=' + encodeURIComponent(query2) + '&format=' + encodeURIComponent(outputFormat);
                rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath2}).then(function(res2){
                    callback(null, {
                        graphName: graphName,
                        page: params.page,
                        facets: {items: utilObject.parseSecondLevelPropertyValues(graphName, res2)},
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
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
