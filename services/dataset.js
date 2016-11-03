'use strict';
import {prepareDG, getEndpointParameters, getHTTPQuery, getHTTPGetURL} from './utils/helpers';
import {enableAuthentication} from '../configs/general';
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
            dg = prepareDG(datasetURI);
            datasetURI = dg.d;
            graphName = dg.g;
            endpointParameters = getEndpointParameters(datasetURI);
            //config handler
            configurator.prepareDatasetConfig(1, datasetURI, (rconfig)=> {
                let maxOnPage = parseInt(rconfig.maxNumberOfResourcesOnPage);
                if(!maxOnPage){
                    maxOnPage = 20;
                }
                let offset = (params.page - 1) * maxOnPage;
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
                query = queryObject.getResourcesByType(graphName, rconfig, maxOnPage, offset);
                //build http uri
                //send request
                rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                    callback(null, {
                        datasetURI: datasetURI,
                        graphName: graphName,
                        resources: utilObject.parseResourcesByType(res, datasetURI),
                        page: params.page,
                        config: rconfig
                    });
                }).catch(function (err) {
                    console.log(err);
                    callback(null, {datasetURI: datasetURI, graphName: graphName, resources: [], page: params.page, config: rconfig});
                });
            });

        } else if (resource === 'dataset.countResourcesByType') {
            //SPARQL QUERY
            datasetURI = (params.id ? decodeURIComponent(params.id) : 0);
            dg = prepareDG(datasetURI);
            datasetURI = dg.d;
            graphName = dg.g;
            endpointParameters = getEndpointParameters(datasetURI);

            //config handler
            configurator.prepareDatasetConfig(1, datasetURI, (rconfig)=> {
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
                query = queryObject.countResourcesByType(graphName, rconfig.resourceFocusType);
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

        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
