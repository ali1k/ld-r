'use strict';
import {getEndpointParameters, getHTTPQuery} from './utils/helpers';
import {authGraphName, enableAuthentication, enableEmailNotifications} from '../configs/general';
import {sendMail} from '../plugins/email/handleEmail';
import AdminQuery from './sparql/AdminQuery';
import AdminUtil from './utils/AdminUtil';
import rp from 'request-promise';
/*-------------config-------------*/
let user;
const headers = {'Accept': 'application/sparql-results+json'};
const outputFormat = 'application/sparql-results+json';
/*-----------------------------------*/
let endpointParameters, graphName, query, queryObject, utilObject;
queryObject = new AdminQuery();
utilObject = new AdminUtil();

export default {
    name: 'admin',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'admin.userslist') {
            //SPARQL QUERY
            graphName = (params.id ? params.id : authGraphName[0]);
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, users: []});
                }else{
                    user = req.user;
                    //only super users have access to admin services
                    if(!parseInt(user.isSuperUser)){
                        callback(null, {graphName: graphName, users: []});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getUsers(graphName);
            //build http uri
            endpointParameters = getEndpointParameters(graphName);
            //send request
            rp.get({uri: getHTTPQuery('read', query, endpointParameters, outputFormat), headers: headers}).then(function(res){
                callback(null, {
                    graphName: graphName,
                    users: utilObject.parseUsers(res)
                });
            }).catch(function (err) {
                console.log(err);
                callback(null, {graphName: graphName, users: []});
            });
        }else if(resource === 'admin.others'){
            console.log('other services');
        }

    },
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    update: (req, resource, params, body, config, callback) => {
        if (resource === 'admin.activateUser') {
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {});
                }else{
                    user = req.user;
                    //only super users have access to admin services
                    if(!parseInt(user.isSuperUser)){
                        callback(null, {});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            endpointParameters = getEndpointParameters(authGraphName[0]);
            query = queryObject.activateUser(endpointParameters.type, authGraphName[0], params.resourceURI);
            //build http uri
            //send request
            rp.post({uri: getHTTPQuery('update', query, endpointParameters, outputFormat)}).then(function(res){
                if(enableEmailNotifications){
                    sendMail('userActivation', '', params.email, '', '', '');
                }
                callback(null, {});
            }).catch(function (err) {
                console.log(err);
                callback(null, {});
            });
        }
    }
    // delete: function(req, resource, params, config, callback) {}
};
