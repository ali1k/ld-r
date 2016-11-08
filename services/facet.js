'use strict';
import {getHTTPQuery, getHTTPGetURL} from './utils/helpers';
import {getDynamicEndpointParameters} from './utils/dynamicHelpers';
import {enableAuthentication} from '../configs/general';
import FacetQuery from './sparql/FacetQuery';
import FacetUtil from './utils/FacetUtil';
import Configurator from './utils/Configurator';
import rp from 'request-promise';
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
const headers = {'Accept': 'application/sparql-results+json'};
let user;
/*-----------------------------------*/
let endpointParameters, datasetURI, dg, graphName, query, queryObject, utilObject, configurator, propertyURI;
queryObject = new FacetQuery();
utilObject = new FacetUtil();
configurator = new Configurator();

export default {
    name: 'facet',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'facet.facetsSideEffect') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);

           //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, graphName: graphName, facets: {}, total: 0, page: 1});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //resource focus type
                let rftconfig = configurator.getResourceFocusType(0, datasetURI);
                query = queryObject.getSideEffects(endpointParameters, graphName, rftconfig.type, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection);
                //build http uri
                //send request
                rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                    callback(null, {
                        datasetURI: datasetURI,
                        graphName: graphName,
                        page: 1,
                        facets: {propertyURI: decodeURIComponent(params.selection.propertyURI), items: utilObject.parseMasterPropertyValues(res)}
                    });
                }).catch(function (err) {
                    console.log(err);
                    callback(null, {datasetURI: datasetURI, graphName: graphName, facets: {}, total: 0, page: 1});
                });
            });

        //handles changes in master level facets
        } else if (resource === 'facet.facetsMaster') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);

           //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, graphName: graphName, facets: {}, total: 0, page: 1});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //do not query if unselected
                if(!Boolean(params.selection.status)){
                    callback(null, {
                        datasetURI: datasetURI,
                        graphName: graphName,
                        page: 1,
                        facets: {propertyURI: decodeURIComponent(params.selection.value), status: false}
                    });
                    return 0;
                }
                //resource focus type
                let rftconfig = configurator.getResourceFocusType(0, datasetURI);
                query = queryObject.getMasterPropertyValues(endpointParameters, graphName, rftconfig.type, decodeURIComponent(params.selection.value));
                //build http uri
                //send request
                rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                    callback(null, {
                        datasetURI: datasetURI,
                        graphName: graphName,
                        page: 1,
                        facets: {status: Boolean(params.selection.status), propertyURI: decodeURIComponent(params.selection.value), items: utilObject.parseMasterPropertyValues(res)}
                    });
                }).catch(function (err) {
                    console.log(err);
                    callback(null, {datasetURI: datasetURI, graphName: graphName, facets: {}, total: 0, page: 1});
                });
            });
        //handles changes in second level facets
        } else if (resource === 'facet.facetsSecondLevel') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //config handler
                configurator.prepareDatasetConfig(1, datasetURI, (rconfig)=> {
                    //resource focus type
                    let rftconfig = configurator.getResourceFocusType(rconfig, graphName);

                    let maxOnPage = parseInt(rconfig.maxNumberOfResourcesOnPage);
                    if(!maxOnPage){
                        maxOnPage = 20;
                    }
                   //control access on authentication
                    if(enableAuthentication){
                        if(!req.user){
                            callback(null, {datasetURI: datasetURI, graphName: graphName, facets: {}, total: 0, page: 1});
                        }else{
                            user = req.user;
                        }
                    }else{
                        user = {accountName: 'open'};
                    }
                    if(params.mode === 'init'){
                        //get all resources
                        query = queryObject.countSecondLevelPropertyValues(endpointParameters, graphName, rftconfig.type, 0, {});
                        //console.log(query);
                    }else{
                        query = queryObject.countSecondLevelPropertyValues(endpointParameters, graphName, rftconfig.type, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection);
                    }
                    //console.log(query);
                    //build http uri
                    //send request
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        let query2 = queryObject.getSecondLevelPropertyValues(endpointParameters, graphName, rftconfig, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection, maxOnPage, params.page);
                         //console.log(query2);
                        rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query2, endpointParameters, outputFormat)), headers: headers}).then(function(res2){
                            callback(null, {
                                datasetURI: datasetURI,
                                graphName: graphName,
                                resourceFocusType: rftconfig.type,
                                page: params.page,
                                facets: {items: utilObject.parseSecondLevelPropertyValues(datasetURI, res2)},
                                total: utilObject.parseCountResourcesByType(res)
                            });
                        }).catch(function (err2) {
                            console.log(err2);
                            callback(null, {datasetURI: datasetURI, graphName: graphName, facets: {}, total: 0, page: 1});
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {datasetURI: datasetURI, graphName: graphName, facets: {}, total: 0, page: 1});
                    });
                });
            });

        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
