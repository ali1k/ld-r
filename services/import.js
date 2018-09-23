'use strict';
import {getHTTPQuery, getHTTPGetURL} from './utils/helpers';
import {getDynamicEndpointParameters} from './utils/dynamicHelpers';
import {createASampleMapping, getJSONLDConfig} from './utils/dynamicHelpers';
import {uploadFolder, enableCSVImport, mappingsDatasetURI, authDatasetURI, enableAuthentication, enableEmailNotifications, baseResourceDomain} from '../configs/general';
import ImportQuery from './sparql/ImportQuery';
import ImportUtil from './utils/ImportUtil';
import rp from 'request-promise';
//CSV parsing
import csv from 'fast-csv';
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
                delimiter: params.delimiter,
                rowDelimiter: '\n',
                headers: true,
                objectMode: true,
                quote: '"',
                escape: '"',
                ignoreEmpty: true
            }
            let stream = fs.createReadStream(csvPath).setEncoding('utf-8');
            let rows = [];
            let csvStream = csv(options)
                .on('data', function(data){
                    counter++;
                    //to limi the number of rows returned
                    if(counter > 5){
                        stream.destroy();
                        callback(null, {rows: rows, total: counter - 1});
                        return 0;
                    }
                    rows.push(data);
                })
                .on('data-invalid', function(data){
                    //do something with invalid row
                    callback(null, {rows: rows, total: 0});
                })
                .on('error', function(data){
                    //do something with invalid row
                    callback(null, {rows: rows, total: 0});
                })
                .on('end', function(){
                    callback(null, {rows: rows, total: counter});
                });

            let counter = 0;
            stream.pipe(csvStream);
        }

    },
    // other methods
    create: function(req, resource, params, body, config, callback) {
        if (resource === 'import.csvmapping') {
            //console.log(params.filePath, params.delimiter, params.columns);
            createASampleMapping(req.user, params.filePath, params.delimiter, params.columns, {}, (res)=>{
                callback(null, {r: res, d: mappingsDatasetURI[0]});
            });
        } else if (resource === 'import.jsonld') {
            //generate and upload the JSON-LD file from CSV config
            getJSONLDConfig(params.resourceURI, {}, (res)=>{
                console.log(res);
                //start creating JOSN-LD
                let csvPath = path.join(__dirname, '..', uploadFolder[0] + '/' + res.csvFile);
                const options = {
                    delimiter: res.delimiter,
                    rowDelimiter: '\n',
                    headers: true,
                    objectMode: true,
                    quote: '"',
                    escape: '"',
                    ignoreEmpty: true
                }
                //---------configurations--------
                let contextObj = {
                    'r': res.resourcePrefix,
                    'v': res.vocabPrefix,
                    'xsd': 'http://www.w3.org/2001/XMLSchema#'
                }
                let contextOptions ={
                    'idColumn': res.idColumn,
                    'entityType': res.entityType,
                    'skippedColumns': res.skippedColumns,
                    'customMappings': res.customMappings
                }
                //-----------------------------
                //automatically add other prefixes from the list
                for(let prop in contextOptions.customMappings){
                    //an external prefix is used
                    let cm = contextOptions.customMappings[prop];
                    //check if it is not based on default vocab
                    if(cm.replace(res.vocabPrefix, '') === cm){
                        //need to find the prefix and add the prefix to list
                        let o = {prefix: '', uri: ''};
                        for(let propf in prefixes.list){
                            if(cm.indexOf(prefixes.list[propf]) !== -1){
                                o.prefix = propf;
                                o.uri = prefixes.list[propf];
                            }
                        }
                        if(o.prefix){
                            if(!contextObj[o.prefix]){
                                contextObj[o.prefix] = o.uri;                                
                            }
                            contextOptions.customMappings[prop] = contextOptions.customMappings[prop].replace(o.uri, o.prefix + ':');
                        }
                    }else{
                        delete contextOptions.customMappings[prop];
                    }
                }
                console.log(contextObj);
                console.log(contextOptions);
                /*
                let stream = fs.createReadStream(csvPath).setEncoding('utf-8');
                let rows = [];
                let csvStream = csv(options)
                    .on('data', function(data){
                        counter++;
                        rows.push(data);
                        //console.log(data);
                    })
                    .on('data-invalid', function(data){
                        //do something with invalid row
                        callback(null, {output: ''});
                    })
                    .on('error', function(data){
                        //do something with invalid row
                        callback(null, {output: ''});
                    })
                    .on('end', function(){
                        callback(null, {output: ''});
                    });

                let counter = 0;
                stream.pipe(csvStream);
                */
                callback(null, {output: ''});
            });
        }
    },
    update: (req, resource, params, body, config, callback) => {
        if (resource === 'admin.test') {

        }
    }
    // delete: function(req, resource, params, config, callback) {}
};
