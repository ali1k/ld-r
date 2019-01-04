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
//in order to add prefixes for URIs
function findPrefixForValue(cm){
    //need to find the prefix and add the prefix to list
    let o = {prefix: '', uri: ''};
    for(let propf in prefixes.list){
        if(cm.indexOf(prefixes.list[propf]) !== -1){
            o.prefix = propf;
            o.uri = prefixes.list[propf];
        }
    }
    return o;
}
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
            if (!fs.existsSync(csvPath)) {
                callback(null, {rows: [], total: 0});
                return 0;
            }
            const options = {
                delimiter: params.delimiter,
                rowDelimiter: '\n',
                headers: true,
                objectMode: true,
                quote: '"',
                escape: '"',
                ignoreEmpty: true
            }
            let stream;
            try {
                stream = fs.createReadStream(csvPath).setEncoding('utf-8');
            }
            catch(error) {
                callback(null, {rows: rows, total: 0});
            }
            let rows = [];
            let csvStream = csv(options)
                .on('data', function(data){
                    counter++;
                    //to limi the number of rows returned
                    if(counter > 10){
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
                //console.log(res);
                //start creating JOSN-LD
                let csvPath = path.join(__dirname, '..', uploadFolder[0] + '/' + res.csvFile);
                let jsonFileName = res.csvFile.split('\.')[0]+'.json';
                let jsonPath = path.join(__dirname, '..', uploadFolder[0] + '/' + jsonFileName);
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
                        let o = findPrefixForValue(cm);
                        if(o.prefix){
                            if(!contextObj[o.prefix]){
                                contextObj[o.prefix] = o.uri;
                            }
                            let propW = prop.replace(res.vocabPrefix, '').replace(baseResourceDomain[0]+'/v/', '');
                            contextOptions.customMappings[propW] = contextOptions.customMappings[prop].replace(o.uri, o.prefix + ':');
                        }
                    }else{
                        //it is the same vocab but not the same property
                        if(prop.endsWith(cm.replace(res.vocabPrefix, ''))){
                            delete contextOptions.customMappings[prop];
                        }else{
                          //fix the mapping by removing the
                          //remove prefix, laso the default one
                          let propW = prop.replace(res.vocabPrefix, '').replace(baseResourceDomain[0]+'/v/', '');
                          let propW_mapping = contextOptions.customMappings[prop];
                          delete contextOptions.customMappings[prop];
                          contextOptions.customMappings[propW] = propW_mapping;
                        }

                    }
                }
                //add prefix for entity type
                if(res.entityType.replace(res.vocabPrefix, '') !== res.entityType){
                    contextOptions.entityType = 'v:' + contextOptions.entityType.replace(res.vocabPrefix, '');
                }else{
                    let o = findPrefixForValue(res.entityType);
                    if(o.prefix){
                        if(!contextObj[o.prefix]){
                            contextObj[o.prefix] = o.uri;
                        }
                        contextOptions.entityType = contextOptions.entityType.replace(o.uri, o.prefix + ':');
                    }
                }
              //  console.log(contextObj);
                //console.log(contextOptions);
                if (!fs.existsSync(csvPath)) {
                    callback(null, {output: ''});
                    return 0;
                }
                let stream;
                try {
                    stream = fs.createReadStream(csvPath).setEncoding('utf-8');
                }
                catch(error) {
                    callback(null, {output: ''});
                }
                let graphArr = [];
                let csvStream = csv(options)
                    .on('data', function(data){
                        counter++;
                        if(counter === 1){
                            for(let prop in data){
                                if (validUrl.isUri(data[prop]) && contextOptions['skippedColumns'].indexOf(camelCase(prop)) == -1){
                                    if(contextOptions['customMappings'] && contextOptions['customMappings'][camelCase(prop)]){
                                        contextObj[contextOptions['customMappings'][camelCase(prop)]] = {
                                            '@type': '@id'
                                        };
                                    }else{
                                        contextObj['v:' + camelCase(prop)] = {
                                            '@type': '@id'
                                        };
                                    }
                                }
                            }
                        }
                        let tmpObj = {};
                        tmpObj['@type'] = contextOptions['entityType'];
                        for(let prop in data){
                            if(!prop.trim()){
                                continue;
                            }
                            if(prop.toLowerCase() === contextOptions['idColumn'].toLowerCase()){
                                tmpObj['@id'] = 'r:' + encodeURIComponent(camelCase(data[prop]));
                            }
                            if(contextOptions['skippedColumns'].indexOf(camelCase(prop)) === -1){
                                if(contextOptions['customMappings'] && contextOptions['customMappings'][camelCase(prop)] && contextOptions['customMappings'][camelCase(prop)] !== camelCase(prop)){
                                    tmpObj[contextOptions['customMappings'][camelCase(prop)].replace(res.vocabPrefix, 'v:')] = isNaN(data[prop]) ? data[prop] : Number(data[prop]) ;
                                }else{
                                    tmpObj['v:'+camelCase(prop)] = isNaN(data[prop]) ? data[prop] : Number(data[prop]) ;
                                }
                            }
                        }
                        graphArr.push(tmpObj);
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
                        let jsonLD = {
                            '@context': contextObj,
                            '@graph': graphArr
                        };
                        fs.writeFile(jsonPath, JSON.stringify(jsonLD), function(err, data){
                            if (err) console.log(err);
                            callback(null, {output: '/' + uploadFolder[0]+ '/' + jsonFileName});
                        });

                    });

                let counter = 0;
                stream.pipe(csvStream);
            });
        }
    },
    update: (req, resource, params, body, config, callback) => {
        if (resource === 'admin.test') {

        }
    }
    // delete: function(req, resource, params, config, callback) {}
};
