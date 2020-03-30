'use strict';
import {sparqlEndpoint} from '../configs/server';
import {getHTTPQuery, getHTTPGetURL, prepareDG} from './utils/helpers';
import {checkViewAccess, checkEditAccess} from './utils/accessManagement';
import {getDynamicEndpointParameters, createASampleReactorConfig, createASampleFacetsConfig, createASampleServerConfig, createAnEnvState, getSavedQueries} from './utils/dynamicHelpers';
import {baseResourceDomain, enableLogs, enableAuthentication, authDatasetURI, configDatasetURI} from '../configs/general';
import ResourceQuery from './sparql/ResourceQuery';
import ResourceUtil from './utils/ResourceUtil';
import Configurator from './utils/Configurator';
import rp from 'request-promise';
import fs from 'fs';
import log4js from 'log4js';
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
    log4js.configure({
        appenders: { ldr: { type: 'file', filename: logPath } },
        categories: { default: { appenders: ['ldr'], level: 'info' } }
    });
    log = log4js.getLogger('ldr');
}
/*-------------config-------------*/
const outputFormat = 'application/sparql-results+json';
const headers = {'Accept': 'application/sparql-results+json'};
/*-----------------------------------*/
let endpointParameters, category, cGraphName, datasetURI, dg, graphName, propertyURI, resourceURI, objectURI, objectValue, query, queryObject, utilObject, configurator, propertyPath, HTTPQueryObject;
queryObject = new ResourceQuery();
utilObject = new ResourceUtil();
configurator = new Configurator();

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
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                resourceURI = params.resource;
                propertyPath = decodeURIComponent(params.propertyPath);
                if(propertyPath.length > 1){
                    propertyPath = propertyPath.split(',');
                }
                //for now only check the dataset access levele
                //todo: extend view access to resource and property level
                configurator.prepareDatasetConfig(user, 1, datasetURI, (rconfig)=> {

                    if(enableAuthentication && rconfig && rconfig.hasLimitedAccess && parseInt(rconfig.hasLimitedAccess)){
                        //need to handle access to the dataset
                        //if user is the editor by default he already has view access
                        let editAccess = checkEditAccess(user, datasetURI, 0, 0, 0);
                        if(!editAccess.access || editAccess.type === 'partial'){
                            let viewAccess = checkViewAccess(user, datasetURI, 0, 0, 0);
                            if(!viewAccess.access){
                                callback(null, {datasetURI: datasetURI, graphName: graphName, resourceURI: resourceURI, resourceType: '', currentCategory: 0, propertyPath: [], properties: [], config: {}, error: 'You do not have enough permision to access this dataset/resource!'});
                                return 0;
                            }
                        }
                    }

                    query = queryObject.getPrefixes() + queryObject.getProperties(endpointParameters, graphName, resourceURI);
                    //console.log(query);
                    //build http uri
                    //send request
                    let props;
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        //exceptional case for user properties: we hide some admin props from normal users
                        utilObject.parseProperties(user, res, datasetURI, resourceURI, category, propertyPath, (cres)=> {
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
                            log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                        }
                        callback(null, {datasetURI: datasetURI, graphName: graphName, resourceURI: resourceURI, resourceType: '', title: '', currentCategory: 0, propertyPath: [], properties: [], config: {}});
                    });
                });
            });

        } else if (resource === 'resource.envStates') {
            getSavedQueries(req.user, (res)=>{
                callback(null, {states: res});
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
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.getProperties(endpointParameters, graphName, objectURI);
                //build http uri
                //send request
                rp.get({uri: getHTTPGetURL(getHTTPQuery('read', query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                    utilObject.parseObjectProperties(user, res, datasetURI, resourceURI, propertyURI, (cres)=> {
                        callback(null, {
                            objectURI: objectURI,
                            objectType: cres.objectType,
                            properties: cres.props
                        });
                    });
                }).catch(function (err) {
                    console.log(err);
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                if(params.delimitedBy){
                    query = queryObject.getPrefixes();
                    let delTmp = params.objectValue.split(params.delimitedBy);
                    delTmp.forEach((dval)=>{
                        query = query + queryObject.addTriple(endpointParameters, graphName, params.resourceURI, params.propertyURI, dval.trim(), params.valueType, params.dataType);
                    });
                }else{
                    query = queryObject.getPrefixes() + queryObject.addTriple(endpointParameters, graphName, params.resourceURI, params.propertyURI, params.objectValue, params.valueType, params.dataType);
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.createObjectDetails(endpointParameters, user, graphName, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType, params.detailData);
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
            if(datasetURI.slice(-1) === '/' || datasetURI.slice(-1) === '#'){
                newResourceURI = datasetURI + 'c' + Math.round(+new Date() / 1000);
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.cloneResource(endpointParameters, user, graphName, params.resourceURI, newResourceURI);
                HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                    }
                    callback(null, {datasetURI: datasetURI, resourceURI: newResourceURI});
                }).catch(function (err) {
                    console.log(err);
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
            //do not allow certain props to be added
            const forbiddenProps = ['https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#cloneOf', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdBy', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdOn']
            if(forbiddenProps.indexOf(params.propertyURI)!== -1){
                if(user && parseInt(user.isSuperUser)){
                    //allow it only for admin user
                }else{
                    callback(null, {category: params.category, datasetURI: datasetURI, resourceURI: params.resourceURI, propertyURI: params.propertyURI, objectValue: params.objectValue});
                    return 0;
                }
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
            let newResourceURI = baseResourceDomain[0] + '/n' + Math.round(+new Date() / 1000);
            //do not add two slashes
            if(baseResourceDomain[0].slice(-1) === '/' || baseResourceDomain[0].slice(-1) === '#'){
                newResourceURI = baseResourceDomain[0] + 'n' + Math.round(+new Date() / 1000);
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.newResource(endpointParameters, user, graphName, newResourceURI, params.templateResource);
                HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                    }
                    callback(null, {datasetURI: datasetURI, resourceURI: newResourceURI});
                }).catch(function (err) {
                    console.log(err);
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                    }
                    callback(null, {datasetURI: datasetURI, resourceURI: newResourceURI});
                });
            });
        //adds ld-r annotations to a resource for a certain property if set
        } else if (resource === 'resource.annotate') {
            datasetURI = params.dataset;
            resourceURI = params.resource;
            propertyURI = params.property;
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
            let targetDataset = datasetURI;
            if(params.inNewDataset){
                targetDataset = params.inNewDataset;
            }
            getDynamicEndpointParameters(user, targetDataset, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.annotateResource(endpointParameters, user, targetDataset, graphName, params.resource, propertyURI, params.annotations, params.inNewDataset, {api: params.api});
                //console.log(query);
                //build http uri
                //send request
                HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                    }
                    callback(null, {datasetURI: targetDataset, resourceURI: params.resource, annotations: params.annotations});
                }).catch(function (err) {
                    console.log(err);
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                    }
                    callback(null, {datasetURI: targetDataset, resourceURI: params.resource, annotations: params.annotations});
                });
            });

        } else if (resource === 'resource.newReactorConfig') {
            datasetURI = params.dataset;
            createASampleReactorConfig(req.user, params.scope, datasetURI, params.resourceURI, params.propertyURI, params.options, (res)=>{
                callback(null, {datasetURI: configDatasetURI[0], resourceURI: res, redirect: params.redirect});
            });
        }else if (resource === 'resource.newServerConfig') {
            datasetURI = params.dataset;
            // use generic endpointType for new datasets
            if(sparqlEndpoint['generic'] && sparqlEndpoint['generic'].endpointType){
                params.options.endpointType = sparqlEndpoint['generic'].endpointType;
            }
            createASampleServerConfig(req.user, datasetURI, params.options, (res)=>{
                callback(null, {datasetURI: datasetURI, redirect: params.redirect});
            });
        }else if (resource === 'resource.newFacetsConfig') {
            let sresourceURI = configDatasetURI[0] + '/fcf' + Math.round(+new Date() / 1000);
            createASampleFacetsConfig(req.user, sresourceURI, params.dataset, params.options, (res)=>{
                callback(null, {datasetURI: configDatasetURI[0], resourceURI: sresourceURI, redirect: params.redirect});
            });
        }else if (resource === 'resource.newEnvState') {
            let sresourceURI = configDatasetURI[0] + '/state' + Math.round(+new Date() / 1000);
            createAnEnvState(req.user, sresourceURI, params, (res)=>{
                callback(null, {});
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    //check access for detail object
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.oldObjectValue, '');
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, datasetURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                        return 0;
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                    }
                    callback(null, {category: params.category});
                });
            });
        } else if (resource === 'resource.delete') {
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
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
                graphName = endpointParameters.graphName;
                query = queryObject.getPrefixes() + queryObject.deleteResource(endpointParameters, user, graphName, params.resourceURI);
                HTTPQueryObject = getHTTPQuery('update', query, endpointParameters, outputFormat);
                rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + ' \n Query: \n' + query);
                    }
                    callback(null, {datasetURI: datasetURI, resourceURI: params.resourceURI});
                }).catch(function (err) {
                    console.log(err);
                    if(enableLogs){
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                    }
                    callback(null, {datasetURI: datasetURI, resourceURI: params.resourceURI});
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
                    /*todo:fix permission on update!
                    accessLevel = utilObject.checkEditAccess(user, datasetURI, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                    */
                }
            }else{
                user = {accountName: 'open'};
            }
            getDynamicEndpointParameters(user, datasetURI, (endpointParameters)=>{
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
                        log.info('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                    }
                    callback(null, {category: params.category});
                });
            });

        }
    }
};
