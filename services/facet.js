'use strict';
import {getEndpointParameters, getHTTPQuery} from './utils/helpers';
import {defaultGraphName, enableAuthentication} from '../configs/general';
import FacetQuery from './sparql/FacetQuery';
import FacetUtil from './utils/FacetUtil';
import Configurator from './utils/Configurator';
import rp from 'request-promise';
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
const headers = {'Accept': 'application/sparql-results+json'};
let user;
/*-----------------------------------*/
let endpointParameters, cGraphName, graphName, query, queryObject, utilObject, configurator, propertyURI;
queryObject = new FacetQuery();
utilObject = new FacetUtil();
configurator = new Configurator();

export default {
    name: 'facet',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'facet.facetsSideEffect') {
            graphName = (params.id ? decodeURIComponent(params.id) : 0);
            endpointParameters = getEndpointParameters(graphName);
            cGraphName = graphName;
            if(endpointParameters.useDefaultGraph){
                cGraphName = 0;
            }else{
                if(!cGraphName){
                    graphName = defaultGraphName[0];
                    cGraphName = defaultGraphName[0];
                }
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
            //resource focus type
            let rftconfig = configurator.getResourceFocusType(graphName);
            query = queryObject.getSideEffects(endpointParameters, cGraphName, rftconfig.type, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection);
            //build http uri
            //send request
            rp.get({uri: getHTTPQuery('read', query, endpointParameters, outputFormat), headers: headers}).then(function(res){
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
        } else if (resource === 'facet.facetsMaster') {
            graphName = (params.id ? decodeURIComponent(params.id) : 0);
            endpointParameters = getEndpointParameters(graphName);
            cGraphName = graphName;
            if(endpointParameters.useDefaultGraph){
                cGraphName = 0;
            }else{
                if(!cGraphName){
                    graphName = defaultGraphName[0];
                    cGraphName = defaultGraphName[0];
                }
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
            //do not query if unselected
            if(!Boolean(params.selection.status)){
                callback(null, {
                    graphName: graphName,
                    page: 1,
                    facets: {propertyURI: decodeURIComponent(params.selection.value), status: false}
                });
                return 0;
            }
            //resource focus type
            let rftconfig = configurator.getResourceFocusType(graphName);
            query = queryObject.getMasterPropertyValues(endpointParameters, cGraphName, rftconfig.type, decodeURIComponent(params.selection.value));
            //build http uri
            //send request
            rp.get({uri: getHTTPQuery('read', query, endpointParameters, outputFormat), headers: headers}).then(function(res){
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
        } else if (resource === 'facet.facetsSecondLevel') {
            graphName = (params.id ? decodeURIComponent(params.id) : 0);
            endpointParameters = getEndpointParameters(graphName);
            cGraphName = graphName;
            if(endpointParameters.useDefaultGraph){
                cGraphName = 0;
            }else{
                if(!cGraphName){
                    graphName = defaultGraphName[0];
                    cGraphName = defaultGraphName[0];
                }
            }
            //config handler
            let rconfig = configurator.prepareDatasetConfig(1, graphName);
            //resource focus type
            let rftconfig = configurator.getResourceFocusType(graphName);
            let maxOnPage = parseInt(rconfig.maxNumberOfResourcesOnPage);
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
                query = queryObject.countSecondLevelPropertyValues(endpointParameters, cGraphName, rftconfig.type, 0, {});
            }else{
                query = queryObject.countSecondLevelPropertyValues(endpointParameters, cGraphName, rftconfig.type, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection);
            }
            //console.log(query);
            //build http uri
            //send request
            rp.get({uri: getHTTPQuery('read', query, endpointParameters, outputFormat), headers: headers}).then(function(res){
                let query2 = queryObject.getSecondLevelPropertyValues(endpointParameters, cGraphName, rftconfig, decodeURIComponent(params.selection.propertyURI), params.selection.prevSelection, maxOnPage, params.page);
                 //console.log(query2);
                rp.get({uri: getHTTPQuery('read', query2, endpointParameters, outputFormat), headers: headers}).then(function(res2){
                    callback(null, {
                        graphName: graphName,
                        resourceFocusType: rftconfig.type,
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
