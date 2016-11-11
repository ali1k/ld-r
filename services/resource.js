'use strict';
import {getHTTPQuery, getHTTPGetURL, prepareDG} from './utils/helpers';
import {getDynamicEndpointParameters} from './utils/dynamicHelpers';
import {enableLogs, enableAuthentication, authDatasetURI} from '../configs/general';
import ResourceQuery from './sparql/ResourceQuery';
import ResourceUtil from './utils/ResourceUtil';
import rp from 'request-promise';
import fs from 'fs';
import Log from 'log';
import async from 'async';
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
            //graph name used for server settings and configs
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                resourceURI = params.resource;
                propertyPath = decodeURIComponent(params.propertyPath);
                if(propertyPath.length > 1){
                    propertyPath = propertyPath.split(',');
                }
                query = queryObject.getPrefixes() + queryObject.getProperties(endpointParameters, graphName, resourceURI);
                //console.log(query);
                //build http uri
                //send request
                let props;
                rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                    //exceptional case for user properties: we hide some admin props from normal users
                    utilObject.parseProperties(res, datasetURI, resourceURI, category, propertyPath, (cres)=> {
                        if(datasetURI === authDatasetURI[0] && !parseInt(user.isSuperUser)){
                            props = utilObject.deleteAdminProperties(cres.props);
                        }else{
                            props = cres.props;
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
                            properties: props,
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
            });

        } else if (resource === 'resource.objectProperties') {
            objectURI = params.objectURI;
            propertyURI = params.propertyURI;
            resourceURI = params.resourceURI;
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.getProperties(endpointParameters, graphName, objectURI);
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
            });
        }

    },
    // other methods
    create: (req, resource, params, body, config, callback) => {
        if (resource === 'resource.individualObject') {
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.addTriple(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.objectValue, params.valueType, params.dataType);
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
            });

        } else if (resource === 'resource.individualObjectDetail') {
            datasetURI = params.dataset;
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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.updateObjectTriples(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType, params.detailData);
                async.parallel([
                    (cback) => {
                        //send request
                        HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                        rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                            if(enableLogs){
                                log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                            }
                            cback();
                        }).catch(function (err) {
                            console.log(err);
                            if(enableLogs){
                                log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                            }
                            cback();
                        });
                    },
                    (cback) => {
                        //we should add this resource into user's profile too
                        if(enableAuthentication){
                            let query2 = queryObject.getPrefixes() + queryObject.addTriple(endpointParameters, prepareDG(authDatasetURI[0]).g, user.id, 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfResource', params.newObjectValue, 'uri', '');
                            //send request
                            HTTPQueryObject = getHTTPQuery('update', query2, endpointParameters, outputFormat);
                            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                                if(enableLogs){
                                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                                }
                                cback();
                            }).catch(function (err) {
                                console.log(err);
                                if(enableLogs){
                                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                                }
                                cback();
                            });
                        }else{
                            cback();
                        }
                    }
                ],
                // final callback
                (err, results) => {
                    if (err){
                        callback(null, {category: params.category});
                        return;
                    }
                    callback(null, {category: params.category});
                });

            });

        } else if (resource === 'resource.clone') {
            datasetURI = params.dataset;
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI, resourceURI: params.resourceURI});
                    return 0;
                }else{
                    user = req.user;
                    //todo: think about the access level in the case of clone
                }
            }else{
                user = {accountName: 'open'};
            }
            let newResourceURI = datasetURI + '/c' + Math.round(+new Date() / 1000);
            //do not add two slashes
            if(datasetURI.slice(-1) === '/'){
                newResourceURI = datasetURI + 'c' + Math.round(+new Date() / 1000);
            }
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.cloneResource(endpointParameters, graphName, params.resourceURI, newResourceURI);
                async.parallel([
                    (cback) => {
                        //send request
                        HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                        rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                            if(enableLogs){
                                log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                            }
                            cback();
                        }).catch(function (err) {
                            console.log(err);
                            if(enableLogs){
                                log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                            }
                            cback();
                        });
                    },
                    (cback) => {
                        //we should add this resource into user's profile too
                        if(enableAuthentication){
                            let query2 = queryObject.getPrefixes() + queryObject.addTriple(endpointParameters, prepareDG(authDatasetURI[0]).g, user.id, 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfResource', newResourceURI, 'uri', '');
                            //send request
                            HTTPQueryObject = getHTTPQuery('update', query2, endpointParameters, outputFormat);
                            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                                if(enableLogs){
                                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                                }
                                cback();
                            }).catch(function (err) {
                                console.log(err);
                                if(enableLogs){
                                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                                }
                                cback();
                            });
                        }else{
                            cback();
                        }
                    }
                ],
                // final callback
                (err, results) => {
                    if (err){
                        callback(null, {datasetURI: datasetURI, resourceURI: newResourceURI});
                        return;
                    }
                    callback(null, {datasetURI: datasetURI, resourceURI: newResourceURI});
                });
            });
        } else if (resource === 'resource.property') {
            datasetURI = params.dataset;
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category, datasetURI: datasetURI, resourceURI: params.resourceURI, propertyURI: params.propertyURI, objectValue: params.objectValue});
                    return 0;
                }else{
                    user = req.user;
                    //todo: think about the access level in the case of clone
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.addTriple(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.objectValue, 'literal', '');
                //build http uri
                //send request
                HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                    }
                    callback(null, {category: params.category, datasetURI: datasetURI, resourceURI: params.resourceURI, propertyURI: params.propertyURI, objectValue: params.objectValue});
                }).catch(function (err) {
                    console.log(err);
                    if(enableLogs){
                        log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                    }
                    callback(null, {category: params.category, datasetURI: datasetURI, resourceURI: params.resourceURI, propertyURI: params.propertyURI, objectValue: params.objectValue});
                });
            });
        } else if (resource === 'resource.new') {
            datasetURI = params.dataset;
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {datasetURI: datasetURI});
                    return 0;
                }else{
                    user = req.user;
                    //todo: think about the access level in the case of clone
                }
            }else{
                user = {accountName: 'open'};
            }
            let newResourceURI = datasetURI + '/n' + Math.round(+new Date() / 1000);
            //do not add two slashes
            if(datasetURI.slice(-1) === '/'){
                newResourceURI = datasetURI + 'n' + Math.round(+new Date() / 1000);
            }
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.newResource(endpointParameters, graphName, newResourceURI);
                async.parallel([
                    (cback) => {
                        //send request
                        HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                        rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                            if(enableLogs){
                                log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                            }
                            cback();
                        }).catch(function (err) {
                            console.log(err);
                            if(enableLogs){
                                log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                            }
                            cback();
                        });
                    },
                    (cback) => {
                        //we should add this resource into user's profile too
                        if(enableAuthentication){
                            let query2 = queryObject.getPrefixes() + queryObject.addTriple(endpointParameters, prepareDG(authDatasetURI[0]).g, user.id, 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfResource', newResourceURI, 'uri', '');
                            if(params.isNewDataset){
                                //when a new dataset is created
                                query2 = query2 + ' ; ' + queryObject.addTriple(endpointParameters, prepareDG(authDatasetURI[0]).g, user.id, 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfDataset', datasetURI, 'uri', '');
                            }
                            //send request
                            HTTPQueryObject = getHTTPQuery('update', query2, endpointParameters, outputFormat);
                            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                                if(enableLogs){
                                    log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                                }
                                cback();
                            }).catch(function (err) {
                                console.log(err);
                                if(enableLogs){
                                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                                }
                                cback();
                            });
                        }else{
                            cback();
                        }
                    }
                ],
                // final callback
                (err, results) => {
                    if (err){
                        callback(null, {datasetURI: datasetURI, resourceURI: newResourceURI});
                        return;
                    }
                    callback(null, {datasetURI: datasetURI, resourceURI: newResourceURI});
                });
            });

        }
    },
    update: (req, resource, params, body, config, callback) => {
        if (resource === 'resource.individualObject') {
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.updateTriple(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType);
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
            });

        } else if(resource === 'resource.individualObjectDetail'){
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.updateObjectTriples(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType, params.detailData);
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
            });

        } else if(resource === 'resource.aggObject'){
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.updateTriples(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.changes);
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
            });

        }
    },
    delete: (req, resource, params, config, callback) => {
        if (resource === 'resource.individualObject') {
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.deleteTriple(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.objectValue, params.valueType, params.dataType);
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
            });

        } else if(resource === 'resource.aggObject') {
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.deleteTriples(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.changes);
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
            });
        } else if(resource === 'resource.property') {
            datasetURI = params.dataset;

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
            getDynamicEndpointParameters(datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                //delete all values
                query = queryObject.getPrefixes() + queryObject.deleteTriple(endpointParameters, graphName, params.resourceURI, params.propertyURI, 0, 0, 0);
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
            });

        }
    }
};
