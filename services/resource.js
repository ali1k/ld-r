'use strict';
import {getEndpointParameters, getHTTPQuery, getHTTPGetURL} from './utils/helpers';
import {enableLogs, enableAuthentication, authDatasetURI} from '../configs/general';
import ResourceQuery from './sparql/ResourceQuery';
import ResourceUtil from './utils/ResourceUtil';
import rp from 'request-promise';
import fs from 'fs';
import Log from 'log';
/*-------------log updates-------------*/
let log;
let user, accessLevel;
if(enableLogs){
    let currentDate = new Date().toDateString().replace(/\s/g, '-');
    let logPath = './logs/' + currentDate + '.log';
    if (fs.existsSync(logPath)) {
        //create a new file when restarting the server
        logPath = './logs/' + currentDate + '_' + Date.now() + '.log';
    }
    log = new Log('debug', fs.createWriteStream(logPath));
}
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
const headers = {'Accept': 'application/sparql-results+json'};
/*-----------------------------------*/
let endpointParameters, category, cGraphName, datasetURI, dg, graphName, propertyURI, resourceURI, objectURI, objectValue, query, queryObject, utilObject, configurator, propertyPath, HTTPQueryObject;
queryObject = new ResourceQuery();
utilObject = new ResourceUtil();

export default {
    name: 'resource',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'resource.properties') {
            category = params.category;
            //SPARQL QUERY
            datasetURI = (params.dataset && params.dataset !== '0' ? decodeURIComponent(params.dataset) : 0);
            //graph name used for server settings and configs
            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            resourceURI = params.resource;
            propertyPath = decodeURIComponent(params.propertyPath);
            if(propertyPath.length > 1){
                propertyPath = propertyPath.split(',');
            }
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, graphName: graphName, resourceURI: resourceURI, resourceType: '', currentCategory: 0, propertyPath: [], properties: [], config: {}});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getProperties(graphName, resourceURI);
            //console.log(query);
            //build http uri
            //send request
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                //exceptional case for user properties: we hide some admin props from normal users
                utilObject.parseProperties(res, datasetURI, resourceURI, category, propertyPath, (cres)=> {
                    if(graphName === authDatasetURI[0] && !parseInt(user.isSuperUser)){
                        props = utilObject.deleteAdminProperties(cres.props);
                    }
                    //------------------------------------
                    callback(null, {
                        datasetURI: datasetURI,
                        graphName: graphName,
                        resourceURI: resourceURI,
                        resourceType: cres.resourceType,
                        title: cres.title,
                        currentCategory: category,
                        propertyPath: propertyPath,
                        properties: cres.props,
                        config: cres.rconfig
                    });
                });

            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {datasetURI: datasetURI, graphName: graphName, resourceURI: resourceURI, resourceType: '', title: '', currentCategory: 0, propertyPath: [], properties: [], config: {}});
            });
        } else if (resource === 'resource.objectProperties') {
            objectURI = params.objectURI;
            propertyURI = params.propertyURI;
            resourceURI = params.resourceURI;
            datasetURI = params.dataset;

            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {objectURI: objectURI, objectType: '', properties: []});
                    return 0;
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getProperties(graphName, objectURI);
            //build http uri
            //send request
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                utilObject.parseObjectProperties(res, datasetURI, resourceURI, propertyURI, (cres)=> {
                    callback(null, {
                        objectURI: objectURI,
                        objectType: cres.objectType,
                        properties: cres.props
                    });
                });
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {objectURI: objectURI, objectType: '', properties: []});
            });
        }

    },
    // other methods
    create: (req, resource, params, body, config, callback) => {
        if (resource === 'resource.individualObject') {
            datasetURI = params.dataset;
            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                    return 0;
                }else{
                    //check if user permitted to do the update action
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getAddTripleQuery(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.objectValue, params.valueType, params.dataType);
            //build http uri
            //send request
            HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                if(enableLogs){
                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                }
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {category: params.category});
            });
        } else if (resource === 'resource.individualObjectDetail') {
            datasetURI = params.dataset;
            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                    return 0;
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getUpdateObjectTriplesForSesame(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType, params.detailData);
            //we should add this resource into user's profile too
            if(enableAuthentication){
                query = query + queryObject.getAddTripleQuery(endpointParameters, authDatasetURI, user.id, 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfResource', params.newObjectValue, 'uri', '');
            }
            //build http uri
            //send request
            HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                if(enableLogs){
                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                }
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {category: params.category});
            });
        }
    },
    update: (req, resource, params, body, config, callback) => {
        if (resource === 'resource.individualObject') {
            datasetURI = params.dataset;

            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                    return 0;
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getUpdateTripleQuery(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType);
            //build http uri
            //send request
            HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                if(enableLogs){
                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                }
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {category: params.category});
            });
        } else if(resource === 'resource.individualObjectDetail'){
            datasetURI = params.dataset;

            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                    return 0;
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    //check access for detail object
                    accessLevel = utilObject.checkAccess(user, datasetURI, params.oldObjectValue, '');
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            endpointParameters = getEndpointParameters(datasetURI);
            query = queryObject.getPrefixes() + queryObject.getUpdateObjectTriplesForSesame(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType, params.detailData);
            //build http uri
            //send request
            HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                if(enableLogs){
                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                }
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {category: params.category});
            });
        } else if(resource === 'resource.aggObject'){
            datasetURI = params.dataset;

            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                    return 0;
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, datasetURI, datasetURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getUpdateTriplesQuery(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.changes);
            //build http uri
            //send request
            HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                if(enableLogs){
                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                }
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {category: params.category});
            });
        }
    },
    delete: (req, resource, params, config, callback) => {
        if (resource === 'resource.individualObject') {
            datasetURI = params.dataset;

            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                    return 0;
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getDeleteTripleQuery(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.objectValue, params.valueType, params.dataType);
            //build http uri
            //send request
            HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                if(enableLogs){
                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                }
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {category: params.category});
            });
        } else if(resource === 'resource.aggObject') {
            datasetURI = params.dataset;

            endpointParameters = getEndpointParameters(datasetURI);
            graphName = endpointParameters.graphName;

            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getDeleteTriplesQuery(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.changes);
            //build http uri
            //send request
            HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                if(enableLogs){
                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                }
                callback(null, {category: params.category});
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {category: params.category});
            });
        }
    }
};
