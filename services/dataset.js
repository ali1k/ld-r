'use strict';
import {getEndpointParameters, getHTTPQuery} from './utils/helpers';
import {defaultGraphName, enableAuthentication} from '../configs/general';
import DatasetQuery from './sparql/DatasetQuery';
import DatasetUtil from './utils/DatasetUtil';
import Configurator from './utils/Configurator';
import rp from 'request-promise';
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
let user;
/*-----------------------------------*/
let endpointParameters, graphName, query, queryObject, utilObject, configurator, propertyURI;
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
            let rconfig = configurator.prepareDatasetConfig(graphName);
            let maxOnPage = parseInt(rconfig.maxNumberOfResourcesOnPage);
            if(!maxOnPage){
                maxOnPage = 20;
            }
            let offset = (params.page - 1) * maxOnPage;
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, resources: [], page: params.page, config: rconfig});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getResourcesByType(graphName, rconfig.resourceFocusType, maxOnPage, offset);
            //build http uri
            endpointParameters = getEndpointParameters(graphName);
            //send request
            rp.get({uri: getHTTPQuery(query, endpointParameters, outputFormat)}).then(function(res){
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
            graphName = (params.id ? decodeURIComponent(params.id) : defaultGraphName[0]);
            //config handler
            let rconfig = configurator.prepareDatasetConfig(graphName);
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
            query = queryObject.countResourcesByType(graphName, rconfig.resourceFocusType);
            //build http uri
            endpointParameters = getEndpointParameters(graphName);
            //send request
            rp.get({uri: getHTTPQuery(query, endpointParameters, outputFormat)}).then(function(res){
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
