'use strict';
import {getHTTPQuery, getHTTPGetURL} from './utils/helpers';
import {getDynamicEndpointParameters, getDynamicDatasets} from './utils/dynamicHelpers';
import {enableAuthentication, authDatasetURI, configDatasetURI, defaultDatasetURI} from '../configs/general';
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
let endpointParameters, datasetURI, dg, graphName, query, queryObject, utilObject, configurator, propertyURI;
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
                    callback(null, {datasetURI: datasetURI, graphName: graphName, resources: [], page: params.page, config: rconfig});
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
                    let page = params.page ? params.page : 1;
                    let offset = (page - 1) * maxOnPage;
                    query = queryObject.getResourcesByType(endpointParameters, graphName, rconfig, maxOnPage, offset);
                    //build http uri
                    //send request
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        callback(null, {
                            datasetURI: datasetURI,
                            graphName: graphName,
                            resources: utilObject.parseResourcesByType(user, res, datasetURI),
                            page: params.page,
                            config: rconfig
                        });
                    }).catch(function (err) {
                        console.log(err);
                        callback(null, {datasetURI: datasetURI, graphName: graphName, resources: [], page: params.page, config: rconfig});
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
                    query = queryObject.countResourcesByType(endpointParameters, graphName, rconfig.resourceFocusType);
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
                    query = queryObject.getResourcePropForAnnotation(endpointParameters, graphName, resourceType ? [resourceType] : rconfig.resourceFocusType, propertyURI, maxOnPage, offset);
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
                    if(ds !== authDatasetURI[0] && ds !== configDatasetURI[0] && ds !== 'generic'){
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
                if(ds !== authDatasetURI[0] && ds !== configDatasetURI[0] && ds !== 'generic'){
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
