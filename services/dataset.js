'use strict';
import {getHTTPQuery, getHTTPGetURL} from './utils/helpers';
import {checkViewAccess, checkEditAccess} from './utils/accessManagement';
import {getDynamicEndpointParameters, getDynamicDatasets} from './utils/dynamicHelpers';
import {enableAuthentication, authDatasetURI, configDatasetURI, defaultDatasetURI, mappingsDatasetURI} from '../configs/general';
import staticReactor from '../configs/reactor';
import staticFacets from '../configs/facets';
import DatasetQuery from './sparql/DatasetQuery';
import DatasetUtil from './utils/DatasetUtil';
import Configurator from './utils/Configurator';
import rp from 'request-promise';
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
const headers = {'Accept': 'application/sparql-results+json'};
let user;
/*-----------------------------------*/
let endpointParameters, datasetURI, dg, graphName, query, query2, queryObject, utilObject, configurator, propertyURI;
queryObject = new DatasetQuery();
utilObject = new DatasetUtil();
configurator = new Configurator();

export default {
    name: 'dataset',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'dataset.resourcesByType') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, graphName: graphName, resources: [], page: params.page, config: rconfig, resourceQuery: ''});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //config handler
                configurator.prepareDatasetConfig(user, 1, datasetURI, (rconfig)=> {
                    let maxOnPage = parseInt(rconfig.maxNumberOfResourcesOnPage);
                    if(!maxOnPage){
                        maxOnPage = 20;
                    }

                    if(enableAuthentication && rconfig && rconfig.hasLimitedAccess && parseInt(rconfig.hasLimitedAccess)){
                        //need to handle access to the dataset
                        //if user is the editor by default he already has view access
                        let editAccess = checkEditAccess(user, datasetURI, 0, 0, 0);
                        if(!editAccess.access){
                            let viewAccess = checkViewAccess(user, datasetURI, 0, 0, 0);
                            if(!viewAccess.access){
                                callback(null, {datasetURI: datasetURI, graphName: graphName, resources: [], page: params.page, config: rconfig, resourceQuery: '', error: 'You do not have enough permision to access this dataset!'});
                                return 0;
                            }
                        }
                    }

                    let page = params.page ? params.page : 1;
                    let offset = (page - 1) * maxOnPage;
                    let searchTerm = params.searchTerm ? params.searchTerm : '';
                    query2 = queryObject.getResourcesByType(endpointParameters, graphName, searchTerm, rconfig, maxOnPage, offset);
                    //build http uri
                    //send request
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query2, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        callback(null, {
                            datasetURI: datasetURI,
                            graphName: graphName,
                            resources: utilObject.parseResourcesByType(user, res, datasetURI, rconfig),
                            page: page,
                            config: rconfig,
                            resourceQuery: query2
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {datasetURI: datasetURI, graphName: graphName, resources: [], page: page, config: rconfig, resourceQuery: ''});
                    });
                });
            });

        } else if (resource === 'dataset.countResourcesByType') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, graphName: graphName, total: 0});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;

                //config handler
                configurator.prepareDatasetConfig(user, 1, datasetURI, (rconfig)=> {

                    if(enableAuthentication && rconfig && rconfig.hasLimitedAccess && parseInt(rconfig.hasLimitedAccess)){
                        //need to handle access to the dataset
                        //if user is the editor by default he already has view access
                        let editAccess = checkEditAccess(user, datasetURI, 0, 0, 0);
                        if(!editAccess.access){
                            let viewAccess = checkViewAccess(user, datasetURI, 0, 0, 0);
                            if(!viewAccess.access){
                                callback(null, {datasetURI: datasetURI, graphName: graphName, total: 0});
                                return 0;
                            }
                        }
                    }

                    query = queryObject.countResourcesByType(endpointParameters, graphName, rconfig);
                    //console.log(query);
                    //build http uri
                    //send request
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        callback(null, {
                            datasetURI: datasetURI,
                            graphName: graphName,
                            total: utilObject.parseCountResourcesByType(res)
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {datasetURI: datasetURI, graphName: graphName, total: 0});
                    });
                });
            });
        } else if (resource === 'dataset.resourceProp') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);
            let resourceType = (params.resourceType ? decodeURIComponent(params.resourceType) : 0);
            let propertyURI= (params.propertyURI ? decodeURIComponent(params.propertyURI) : 0);
            if(!datasetURI || !propertyURI){
                callback(null, {datasetURI: datasetURI, graphName: graphName, resources: []});
                return 0;
            }
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, graphName: graphName, resources: []});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //config handler
                configurator.prepareDatasetConfig(user, 1, datasetURI, (rconfig)=> {
                    let maxOnPage = rconfig.maxNumberOfResourcesOnPage ? parseInt(rconfig.maxNumberOfResourcesOnPage) : 20;
                    maxOnPage = params.maxOnPage ? parseInt(params.maxOnPage) : maxOnPage;
                    let page = params.page ? params.page : 1;
                    let offset = (page - 1) * maxOnPage;
                    query = queryObject.getResourcePropForAnnotation(endpointParameters, graphName, rconfig, resourceType, propertyURI, maxOnPage, offset, params.inNewDataset);
                    //console.log(query);
                    //build http uri
                    //send request
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        callback(null, {
                            datasetURI: datasetURI,
                            resourceType : resourceType ? [resourceType] : rconfig.resourceFocusType,
                            propertyURI: propertyURI,
                            graphName: graphName,
                            resources: utilObject.parseResourcePropForAnnotation(res)
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {datasetURI: datasetURI, resourceType : resourceType ? [resourceType] : rconfig.resourceFocusType, graphName: graphName, propertyURI: propertyURI, resources: []});
                    });
                });
            });
        } else if (resource === 'dataset.countAnnotatedResourcesWithProp') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);
            let resourceType = (params.resourceType ? decodeURIComponent(params.resourceType) : 0);
            let propertyURI= (params.propertyURI ? decodeURIComponent(params.propertyURI) : 0);
            if(!datasetURI || !propertyURI){
                callback(null, {datasetURI: datasetURI, propertyURI: propertyURI, annotated: 0, total: 0});
                return 0;
            }
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, propertyURI: propertyURI, annotated: 0, total: 0});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            let targetDataset = datasetURI;
            if(params.inANewDataset){
                targetDataset = params.inANewDataset;
            }
            getDynamicEndpointParameters(user, targetDataset, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //config handler
                configurator.prepareDatasetConfig(user, 1, targetDataset, (rconfig)=> {
                    query = queryObject.countAnnotatedResourcesWithProp(endpointParameters, endpointParameters.graphName, rconfig, resourceType, propertyURI, params.inANewDataset);
                    //console.log(query);
                    //build http uri
                    //send request
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        callback(null, {
                            datasetURI: targetDataset,
                            resourceType : resourceType ? [resourceType] : rconfig.resourceFocusType,
                            propertyURI: propertyURI,
                            graphName: endpointParameters.graphName,
                            annotated: utilObject.parseCountAnnotatedResourcesWithProp(res)
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {datasetURI: targetDataset, propertyURI: propertyURI, annotated: 0});
                    });
                });
            });
        } else if (resource === 'dataset.countTotalResourcesWithProp') {
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);
            let resourceType = (params.resourceType ? decodeURIComponent(params.resourceType) : 0);
            let propertyURI= (params.propertyURI ? decodeURIComponent(params.propertyURI) : 0);
            if(!datasetURI || !propertyURI){
                callback(null, {datasetURI: datasetURI, propertyURI: propertyURI, total: 0});
                return 0;
            }
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, propertyURI: propertyURI, total: 0});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //config handler
                configurator.prepareDatasetConfig(user, 1, datasetURI, (rconfig)=> {
                    query = queryObject.countTotalResourcesWithProp(endpointParameters, graphName, rconfig, resourceType, propertyURI, params.inANewDataset);
                    //console.log(query);
                    //build http uri
                    //send request
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        callback(null, {
                            datasetURI: datasetURI,
                            resourceType : resourceType ? [resourceType] : rconfig.resourceFocusType,
                            propertyURI: propertyURI,
                            graphName: graphName,
                            total: utilObject.parseCountTotalResourcesWithProp(res)
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {datasetURI: datasetURI, propertyURI: propertyURI, total: 0});
                    });
                });
            });
        } else if (resource === 'dataset.datasetsList') {
            let staticReactorDS = {dataset: {}};
            let staticFacetsDS = {facets: {}};
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {dynamicReactorDS: {datasets: {}}, dynamicFacetsDS: {facets: {}}, staticReactorDS: staticReactorDS, staticFacetsDS: staticFacetsDS});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            //filter the config
            let sources = ['dataset', 'dataset_resource', 'dataset_property', 'dataset_resource_property'];
            sources.forEach(function(s){
                for(let ds in staticReactor.config[s]){
                    if(ds !== authDatasetURI[0] && ds !== configDatasetURI[0] && ds !== mappingsDatasetURI[0] && ds !== 'generic'){
                        if(!staticReactorDS.dataset[ds]){
                            staticReactorDS.dataset[ds] = {};
                        }
                        if(s === 'dataset'){
                            staticReactorDS.dataset[ds] = staticReactor.config[s][ds];
                        }
                        if(ds === defaultDatasetURI[0]){
                            staticReactorDS.dataset[ds].isDefaultDataset = 1;
                        }
                    }
                }
            });
            for(let ds in staticFacets.facets){
                if(ds !== authDatasetURI[0] && ds !== configDatasetURI[0] && ds !== mappingsDatasetURI[0] && ds !== 'generic'){
                    if(!staticFacetsDS.facets[ds]){
                        staticFacetsDS.facets[ds]= {};
                    }
                    if(ds === defaultDatasetURI[0]){
                        staticFacetsDS.facets[ds].isDefaultDataset = 1;
                    }
                }
            }
            getDynamicDatasets(user, (dynamicReactorDS, dynamicFacetsDS)=>{
                callback(null, {dynamicReactorDS: dynamicReactorDS, dynamicFacetsDS: dynamicFacetsDS, staticReactorDS: staticReactorDS, staticFacetsDS: staticFacetsDS});
            });
        }
    }
    // create: (req, resource, params, body, config, callback) => {
    //     if (resource === 'dataset.etc') {
    //
    //     }
    // }
    // other methods
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
