'use strict';
import {getHTTPQuery, getHTTPGetURL} from './utils/helpers';
import {getDynamicEndpointParameters} from './utils/dynamicHelpers';
import {authDatasetURI, enableAuthentication, enableEmailNotifications, baseResourceDomain} from '../configs/general';
import ImportQuery from './sparql/ImportQuery';
import ImportUtil from './utils/ImportUtil';
import rp from 'request-promise';
//CSV parsing
import csv from 'csv-streamify';
import fs from 'fs';
import path from 'path';
import camelCase from 'camelcase';
import validUrl from 'valid-url';
import prefixes from '../data/prefixes';
/*-------------config-------------*/
let user;
const headers = {'Accept': 'application/sparql-results+json'};
const outputFormat = 'application/sparql-results+json';
/*-----------------------------------*/
let endpointParameters, dg, graphName, datasetURI, query, queryObject, utilObject, HTTPQueryObject;
queryObject = new ImportQuery();
utilObject = new ImportUtil();

export default {
    name: 'import',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'import.csvparse') {
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {rows: [], total: 0});
                }else{
                    user = req.user;
                    //only super users have access to admin services
                    if(!parseInt(user.isSuperUser)){
                        callback(null, {rows: [], total: 0});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
            if(!params.fileName || !params.delimiter){
                callback(null, {rows: [], total: 0});
                return 0;
            }
            //console.log(params.fileName, params.delimiter);
            let csvPath = path.join(__dirname, '..', params.fileName);
            const options = {
                delimiter: params.delimiter, // comma, semicolon, whatever
                newline: '\n', // newline character (use \r\n for CRLF files)
                quote: '"', // what's considered a quote
                empty: 'NA', // empty fields are replaced by this,
                // if true, emit arrays instead of stringified arrays or buffers
                objectMode: false,
                // if set to true, uses first row as keys -> [ { column1: value1, column2: value2 }, ...]
                columns: true
            }
            const parser = csv(options, function (err, result) {
                if (err) {
                    throw err;
                    callback(null, {rows: [], total: 0});
                }
                let noOfRows = result.length;
                if(noOfRows){
                    if(noOfRows > 5){
                        //console.log(result.slice(0, 5));
                        callback(null, {rows: result.slice(0, 5), total: noOfRows});
                    }else{
                        //console.log(result);
                        callback(null, {rows: result, total: noOfRows});
                    }
                }else{
                    callback(null, {rows: [], total: 0});
                }

            });
            fs.createReadStream(csvPath).pipe(parser);
        }

    },
    // other methods
    create: function(req, resource, params, body, config, callback) {
        if (resource === 'import.csvmapping') {
            if(enableAuthentication){
                if(!req.user){
                    callback(null, {rows: [], total: 0});
                }else{
                    user = req.user;
                    //only super users have access to admin services
                    if(!parseInt(user.isSuperUser)){
                        callback(null, {rows: [], total: 0});
                    }
                }
            }else{
                user = {accountName: 'open'};
            }
        }
    },
    update: (req, resource, params, body, config, callback) => {
        if (resource === 'admin.test') {

        }
    }
    // delete: function(req, resource, params, config, callback) {}
};
