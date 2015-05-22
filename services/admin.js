'use strict';

import {sparqlEndpoint} from '../configs/general';
import {authGraphName, enableAuthentication} from '../configs/reactor';
import AdminQuery from './sparql/AdminQuery';
import AdminUtil from './utils/AdminUtil';
import rp from 'request-promise';
/*-------------config-------------*/
const httpOptions = {
  host: sparqlEndpoint[0].host,
  port: sparqlEndpoint[0].port,
  path: sparqlEndpoint[0].path
};
let user;
const outputFormat = 'application/sparql-results+json';
const defaultGraphName = authGraphName;
/*-----------------------------------*/
let rpPath, graphName, query, queryObject, utilObject;
queryObject = new AdminQuery();
utilObject = new AdminUtil();

export default {
    name: 'admin',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'admin.userslist') {
            //SPARQL QUERY
            graphName = (params.id? params.id: defaultGraphName);
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {graphName: graphName, users: []});
                }else{
                    user = req.user;
                }
            }else{
                user = {accountName: 'open'};
            }
            query = queryObject.getUsers(graphName);
            //build http uri
            rpPath = httpOptions.path+'?query='+ encodeURIComponent(query)+ '&format='+encodeURIComponent(outputFormat);
            //send request
            rp.get({uri: 'http://'+httpOptions.host+':'+httpOptions.port+ rpPath}).then(function(res){
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

    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
