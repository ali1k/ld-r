'use strict';
import {getEndpointParameters, getHTTPQuery} from './utils/helpers';
import {defaultGraphName, enableAuthentication} from '../configs/general';
import DatasetQuery from './sparql/DatasetQuery';
import DatasetUtil from './utils/DatasetUtil';
import Configurator from './utils/Configurator';
import rp from 'request-promise';
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
const headers = {'Accept': 'application/sparql-results+json'};
let user;
/*-----------------------------------*/
let endpointParameters, cGraphName, graphName, query, queryObject, utilObject, configurator, propertyURI;
queryObject = new DatasetQuery();
utilObject = new DatasetUtil();
configurator = new Configurator();

export default {
    name: 'dataset',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'dataset.resourcesByType') {
            graphName = (params.id ? decodeURIComponent(params.id) : 0);
            endpointParameters = getEndpointParameters(graphName);
            //graph name used for server settings and configs
            cGraphName = graphName;
            //overwrite graph name for the ones with default graph
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
            let maxOnPage = parseInt(rconfig.maxNumberOfResourcesOnPage);
            if(!maxOnPage){
                maxOnPage = 20;
            }
            let offset = (params.page - 1) * maxOnPage;
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, resources: [], page: params.page, config: rconfig});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getResourcesByType(cGraphName, rconfig, maxOnPage, offset);
            //build http uri
            //send request
            rp.get({uri: getHTTPQuery('read', query, endpointParameters, outputFormat), headers: headers}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    resources: utilObject.parseResourcesByType(res, graphName),
                    page: params.page,
                    config: rconfig
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, resources: [], page: params.page, config: rconfig});
            });
        } else if (resource === 'dataset.countResourcesByType') {
            //SPARQL QUERY
            graphName = (params.id ? decodeURIComponent(params.id) : 0);
            cGraphName = graphName;
            endpointParameters = getEndpointParameters(graphName);
            //overwrite graph name for the ones with default graph
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
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, total: 0});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.countResourcesByType(cGraphName, rconfig.resourceFocusType);
            //build http uri
            //send request
            rp.get({uri: getHTTPQuery('read', query, endpointParameters, outputFormat), headers: headers}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    total: utilObject.parseCountResourcesByType(res)
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, total: 0});
            });
            //used to update other facets based on a change in a facet
        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
