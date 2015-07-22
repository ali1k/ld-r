'use strict';
import {getHTTPOptions} from './utils/helpers';
import {defaultGraphName, enableAuthentication} from '../configs/reactor';
import DatasetQuery from './sparql/DatasetQuery';
import DatasetUtil from './utils/DatasetUtil';
import Configurator from './utils/Configurator';
import rp from 'request-promise';
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
let user;
/*-----------------------------------*/
let httpOptions, rpPath, graphName, query, queryObject, utilObject, configurator, propertyURI;
queryObject = new DatasetQuery();
utilObject = new DatasetUtil();
configurator = new Configurator();

export default {
    name: 'dataset',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'dataset.resourcesByType') {
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
            //config handler
            let config = configurator.prepareDatasetConfig(graphName);
            let maxOnPage = parseInt(config.maxNumberOfResourcesOnPage);
            if(!maxOnPage){
                maxOnPage = 20;
            }
            let offset = (params.page - 1) * maxOnPage;
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, resources: [], page: params.page, config: config});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getResourcesByType(graphName, config.resourceFocusType, maxOnPage, offset);
            //build http uri
            httpOptions = getHTTPOptions(graphName);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    resources: utilObject.parseResourcesByType(res, graphName),
                    page: params.page,
                    config: config
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, resources: [], page: params.page, config: config});
            });
        } else if (resource === 'dataset.countResourcesByType') {
            //SPARQL QUERY
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
            //config handler
            let config = configurator.prepareDatasetConfig(graphName);
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, total: 0});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.countResourcesByType(graphName, config.resourceFocusType);
            //build http uri
            httpOptions = getHTTPOptions(graphName);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    total: utilObject.parseCountResourcesByType(res)
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, total: 0});
            });
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
            //config handler
            let config = configurator.prepareDatasetConfig(graphName);
            let maxOnPage = parseInt(config.maxNumberOfResourcesOnPage);
            if(!maxOnPage){
                maxOnPage = 20;
            }
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
