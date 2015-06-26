'use strict';
import {getHTTPOptions} from './utils/helpers';
import {defaultGraphName, enableLogs, enableAuthentication, authGraphName} from '../configs/reactor';
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
/*-----------------------------------*/
let httpOptions, rpPath, category, graphName, propertyURI, resourceURI, objectURI, objectValue, query, queryObject, utilObject, propertyPath;
queryObject = new ResourceQuery();
utilObject = new ResourceUtil();

export default {
    name: 'resource',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'resource.properties') {
            category = params.category;
            //SPARQL QUERY
            graphName = params.dataset;
            resourceURI = params.resource;
            propertyPath = decodeURIComponent(params.propertyPath);
            if(propertyPath.length > 1){
                propertyPath = propertyPath.split(',');
            }
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, resourceURI: resourceURI, currentCategory: 0, propertyPath: [], properties: []});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getProperties(graphName, resourceURI);
            // console.log(query);
            //build http uri
            httpOptions = getHTTPOptions(graphName);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                //exceptional case for user properties: we hide some admin props from normal users
                let {props, title} = utilObject.parseProperties(res, graphName, category, propertyPath);
                if(graphName === authGraphName[0] && !parseInt(user.isSuperUser)){
                    props = utilObject.deleteAdminProperties(props);
                }
                //------------------------------------
                callback(null, {
                    graphName: graphName,
                    resourceURI: resourceURI,
                    title: title,
                    currentCategory: category,
                    propertyPath: propertyPath,
                    properties: props
                });
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {graphName: graphName, resourceURI: resourceURI, title: '', currentCategory: 0, propertyPath: [], properties: []});
            });
        } else if (resource === 'resource.objectProperties') {
            graphName = params.dataset;
            objectURI = params.objectURI;
            propertyURI = params.propertyURI;
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {objectURI: objectURI, properties: []});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.getProperties(graphName, objectURI);
            httpOptions = getHTTPOptions(graphName);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
                callback(null, {
                    objectURI: objectURI,
                    properties: utilObject.parseObjectProperties(graphName, propertyURI, res)
                });
            }).catch(function (err) {
                console.log(err);
                if(enableLogs){
                    log.error('\n User: ' + user.accountName + '\n Status Code: \n' + err.statusCode + '\n Error Msg: \n' + err.message);
                }
                callback(null, {objectURI: objectURI, properties: []});
            });
        }

    },
    // other methods
     create: (req, resource, params, body, config, callback) => {
         if (resource === 'resource.individualObject') {
             //control access on authentication
             if(enableAuthentication){
                 if(!req.user){
                     callback(null, {category: params.category});
                 }else{
                     //check if user permitted to do the update action
                     user = req.user;
                     accessLevel = utilObject.checkAccess(user, params.dataset, params.resourceURI, params.propertyURI);
                     if(!accessLevel.access){
                         //action not allowed!
                         callback(null, {category: params.category});
                     }
                 }
             }else{
                 user = {accountName: 'open'};
             }
             query = queryObject.getPrefixes() + queryObject.addTriple(params.dataset, params.resourceURI, params.propertyURI, params.objectValue, params.valueType, params.dataType);
             httpOptions = getHTTPOptions(params.dataset);
             rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
             //send request
             rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
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
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, params.dataset, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.updateTriple(params.dataset, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType);
            httpOptions = getHTTPOptions(params.dataset);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
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
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, params.dataset, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.updateObjectTriples(params.dataset, params.resourceURI, params.propertyURI, params.oldObjectValue, params.newObjectValue, params.valueType, params.dataType, params.detailData);
            httpOptions = getHTTPOptions(params.dataset);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
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
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, params.dataset, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.updateTriples(params.dataset, params.resourceURI, params.propertyURI, params.changes);
            httpOptions = getHTTPOptions(params.dataset);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
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
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, params.dataset, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.deleteTriple(params.dataset, params.resourceURI, params.propertyURI, params.objectValue, params.valueType, params.dataType);
            httpOptions = getHTTPOptions(params.dataset);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
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
            //control access on authentication
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {category: params.category});
                }else{
                    user = req.user;
                    accessLevel = utilObject.checkAccess(user, params.dataset, params.resourceURI, params.propertyURI);
                    if(!accessLevel.access){
                        //action not allowed!
                        callback(null, {category: params.category});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getPrefixes() + queryObject.deleteTriples(params.dataset, params.resourceURI, params.propertyURI, params.changes);
            httpOptions = getHTTPOptions(params.dataset);
            rpPath = httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://' + httpOptions.host + ':' + httpOptions.port + rpPath}).then(function(res){
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
