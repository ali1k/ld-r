import {enableDynamicReactorConfiguration, enableDynamicServerConfiguration, enableDynamicFacetsConfiguration, configDatasetURI, enableAutomaticConfiguration, authDatasetURI, enableQuerySaveImport} from '../../configs/general';
import {getStaticEndpointParameters, getHTTPQuery, getHTTPGetURL} from '../../services/utils/helpers';
import rp from 'request-promise';
const ldr_prefix = 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#';
const sparql_endpoint_error = '**Please also check if the configuration SPARQL endpoint is running and is updateable**';

class DynamicConfigurator {
    getDynamicDatasets(user, callback) {
        let dynamicReactorDS  = {dataset:{}};
        let dynamicFacetsDS = {facets:{}};
        if(!enableDynamicReactorConfiguration && !enableDynamicFacetsConfiguration){
            callback(dynamicReactorDS, dynamicFacetsDS);
        }else{
            let userSt = '';
            //admin has full power on editing
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for server configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let query = '';
            if(enableDynamicReactorConfiguration){
                if(userSt){
                    query = `
                    SELECT DISTINCT ?config1 ?dataset ?setting ?settingValue WHERE {
                        ${graph}
                            {
                            ?config1 a ldr:ReactorConfig ;
                                    ${userSt}
                                    ldr:dataset ?dataset ; ?setting ?settingValue .
                            }
                            UNION
                            {
                            ?config1 a ldr:ReactorConfig ;
                                    ldr:dataset ?dataset ; ?setting ?settingValue .
                                    filter not exists {
                                        ?config1 ldr:createdBy ?user.
                                    }
                            }
                        ${graphEnd}
                    }
                    `;
                }else{
                    query = `
                    SELECT DISTINCT ?config1 ?setting ?settingValue WHERE {
                        ${graph}
                            ?config1 a ldr:ReactorConfig ;
                                    ldr:dataset ?dataset ; ?setting ?settingValue .
                        ${graphEnd}
                    }
                    `;
                }
            }
            if(enableDynamicFacetsConfiguration){
                if(userSt){
                    query = `
                    SELECT DISTINCT ?config2 ?dataset WHERE {
                        ${graph}
                        {
                            ?config2 a ldr:FacetsConfig ;
                                ${userSt}
                                ldr:dataset ?dataset .
                        }
                        UNION
                        {
                            ?config2 a ldr:FacetsConfig ;
                                ldr:dataset ?dataset .
                            filter not exists {
                                ?config2 ldr:createdBy ?user.
                            }
                        }
                        ${graphEnd}
                    }
                    `;
                }else{
                    query = `
                    SELECT DISTINCT ?config2 ?dataset WHERE {
                        ${graph}
                            ?config2 a ldr:FacetsConfig ;
                                    ldr:dataset ?dataset .
                        ${graphEnd}
                    }
                    `;
                }
            }
            if(enableDynamicReactorConfiguration && enableDynamicFacetsConfiguration){
                if(userSt){
                    query = `
                    SELECT DISTINCT ?config1 ?config2 ?dataset ?setting ?settingValue WHERE { ${graph}
                            {
                            ?config1 a ldr:ReactorConfig ;
                                    ${userSt}
                                    ldr:dataset ?dataset ; ?setting ?settingValue .
                            }
                            UNION
                            {
                            ?config2 a ldr:FacetsConfig ;
                                    ${userSt}
                                    ldr:dataset ?dataset .
                            }
                            UNION
                            {
                            ?config1 a ldr:ReactorConfig ;
                                    ldr:dataset ?dataset ; ?setting ?settingValue .
                                    filter not exists {
                                        ?config1 ldr:createdBy ?user.
                                    }
                            }
                            UNION
                            {
                            ?config2 a ldr:FacetsConfig ;
                                    ldr:dataset ?dataset .
                                filter not exists {
                                    ?config2 ldr:createdBy ?user.
                                }
                            }
                    ${graphEnd}
                    }
                    `;
                }else{
                    query = `
                    SELECT DISTINCT ?config1 ?config2 ?dataset ?setting ?settingValue WHERE { ${graph}
                            {
                            ?config1 a ldr:ReactorConfig ;
                                    ldr:dataset ?dataset ; ?setting ?settingValue .
                            }
                            UNION
                            {
                            ?config2 a ldr:FacetsConfig ;
                                    ldr:dataset ?dataset .
                            }
                    ${graphEnd}
                    }
                    `;
                }
            }
            //send request
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                let tmp = self.parseDynamicDatasets(res);
                callback(tmp.dynamicReactorDS, tmp.dynamicFacetsDS);
            }).catch(function (err) {
                console.log('Error in dynamic datasets list query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(dynamicReactorDS, dynamicFacetsDS);
            });
        }

    }
    prepareDynamicServerConfig(user, datasetURI, callback) {
        let config = {sparqlEndpoint: {}};
        //the following graphs shold be only locally reachable
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicServerConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for server configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            const noAuthQuery  = `
            SELECT DISTINCT ?config ?label ?host ?port ?path ?endpointType ?setting ?settingValue WHERE {
                ${graph}
                    ?config a ldr:ServerConfig ;
                            ldr:dataset <${datasetURI}> ;
                            ldr:host ?host ;
                            ldr:port ?port ;
                            ldr:path ?path ;
                            ldr:endpointType ?endpointType ;
                            ?setting ?settingValue .
                            OPTIONAL { ?config rdfs:label ?label . }
                            FILTER (?setting !=rdf:type && ?setting !=ldr:dataset && ?setting !=ldr:host && ?setting !=ldr:port && ?setting !=ldr:path && ?setting !=ldr:endpointType)
                ${graphEnd}
            }
            `;
            let query;
            if(userSt){
                query = `
                SELECT DISTINCT ?config ?label ?host ?port ?path ?endpointType ?setting ?settingValue WHERE {
                    ${graph}
                    {
                        ?config a ldr:ServerConfig ;
                                ${userSt}
                                ldr:dataset <${datasetURI}> ;
                                ldr:host ?host ;
                                ldr:port ?port ;
                                ldr:path ?path ;
                                ldr:endpointType ?endpointType ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config rdfs:label ?label . }
                                FILTER (?setting !=rdf:type && ?setting !=ldr:dataset && ?setting !=ldr:host && ?setting !=ldr:port && ?setting !=ldr:path && ?setting !=ldr:endpointType)
                    }
                    UNION
                    {
                        ?config a ldr:ServerConfig ;
                                ldr:dataset <${datasetURI}> ;
                                ldr:host ?host ;
                                ldr:port ?port ;
                                ldr:path ?path ;
                                ldr:endpointType ?endpointType ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config rdfs:label ?label . }
                                FILTER (?setting !=rdf:type && ?setting !=ldr:dataset && ?setting !=ldr:host && ?setting !=ldr:port && ?setting !=ldr:path && ?setting !=ldr:endpointType)
                                filter not exists {
                                    ?config ldr:createdBy ?user.
                                }
                    }
                    ${graphEnd}
                }
                `;
            }else{
                query = noAuthQuery;
            }
            //send request
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                config = self.parseServerConfigs(config, datasetURI, res);
                if(userSt && !config.resultSetCount){
                    //if no config was found for user in the auth mode, try to get a random config from other users
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + noAuthQuery, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        config = self.parseServerConfigs(config, datasetURI, res);
                        callback(config);
                    }).catch(function (err) {
                        console.log('Attempt 2: Error in server config query:', prefixes + query);
                        console.log(sparql_endpoint_error);
                        console.log('---------------------------------------------------------');
                        callback(config);
                    });
                }else{
                    callback(config);
                }
            }).catch(function (err) {
                console.log('Error in server config query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }

    }
    getSavedQueries(user, callback) {
        let states = {};
        //do not get if disabled
        if(!enableQuerySaveImport){
            callback(config);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for server configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let query;
            if(userSt){
                query = `
                SELECT DISTINCT ?state ?setting ?settingValue WHERE {
                    ${graph}
                    {
                        ?state a ldr:EnvState ;
                                ${userSt}
                                ?setting ?settingValue .
                                FILTER (?setting !=rdf:type)
                    }
                    UNION
                    {
                        ?state a ldr:EnvState ;
                                ?setting ?settingValue .
                                FILTER (?setting !=rdf:type)
                                filter not exists {
                                    ?state ldr:createdBy ?user.
                                }
                    }
                    ${graphEnd}
                }
                `;
            }else{
                query = `
                SELECT DISTINCT ?state ?setting ?settingValue WHERE {
                    ${graph}
                        ?state a ldr:EnvState ;
                                ?setting ?settingValue .
                                FILTER (?setting !=rdf:type)
                    ${graphEnd}
                }
                `;
            }
            //send request
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                states = self.parseEnvStateConfigs(res);
                callback(states);
            }).catch(function (err) {
                console.log('Error in state config query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(states);
            });
        }

    }
    prepareDynamicFacetsConfig(user, datasetURI, callback) {
        let config = {facets: {}};
        //the following graphs shold be only locally reachable
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicFacetsConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let noAuthQuery = `
            SELECT DISTINCT ?config ?label ?list ?configProperty ?setting ?settingValue WHERE {
                ${graph}
                    ?config a ldr:FacetsConfig ;
                            ldr:dataset <${datasetURI}> ;
                            ldr:list ?list ;
                            ldr:config ?facetPConfig .
                            OPTIONAL { ?config rdfs:label ?label . }
                            OPTIONAL { ?facetPConfig a ldr:FacetsPropertyConfig ;
                                          ldr:property ?configProperty ;
                                          ?setting ?settingValue .
                                      FILTER (?setting !=rdf:type && ?setting !=ldr:property)
                            }
                ${graphEnd}
            }
            `;
            let query;
            if(userSt){
                query = `
                SELECT DISTINCT ?config ?label ?list ?configProperty ?setting ?settingValue WHERE {
                    ${graph}
                    {
                        ?config a ldr:FacetsConfig ;
                                ldr:dataset <${datasetURI}> ;
                                ${userSt}
                                ldr:list ?list ;
                                ldr:config ?facetPConfig .
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL { ?facetPConfig a ldr:FacetsPropertyConfig ;
                                              ldr:property ?configProperty ;
                                              ?setting ?settingValue .
                                              FILTER (?setting !=rdf:type && ?setting !=ldr:property)
                                }
                    }
                    UNION
                    {
                        ?config a ldr:FacetsConfig ;
                                ldr:dataset <${datasetURI}> ;
                                ldr:list ?list ;
                                ldr:config ?facetPConfig .
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL {?facetPConfig a ldr:FacetsPropertyConfig ;
                                              ldr:property ?configProperty ;
                                              ?setting ?settingValue .
                                              FILTER (?setting !=rdf:type && ?setting !=ldr:property)
                                }
                                filter not exists {
                                    ?config ldr:createdBy ?user.
                                }
                    }
                    ${graphEnd}
                }
                `;
            }else{
                query = noAuthQuery;
            }
            //send request
            //console.log(prefixes + query);
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                config = self.parseFacetsConfigs(config, datasetURI, res);
                //if no config was found for user in the auth mode, try to get a random config from other users
                if(userSt && !config.resultSetCount){
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + noAuthQuery, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        config = self.parseFacetsConfigs(config, datasetURI, res);
                        callback(config);
                    }).catch(function (err) {
                        console.log('Attempt2: Error in facets config query:', prefixes + query);
                        console.log(sparql_endpoint_error);
                        console.log('---------------------------------------------------------');
                        callback(config);
                    });
                }else{
                    callback(config);
                }
            }).catch(function (err) {
                console.log('Error in facets config query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }
    }
    prepareDynamicDatasetConfig(user, datasetURI, callback) {
        let config = {dataset: {}};
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicReactorConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let noAuthQuery = `
            SELECT DISTINCT ?config ?scope ?label ?setting ?settingValue ?constraintProperty ?constraintObject ?constraintEnabled ?cSetting ?cValue  WHERE {
                ${graph}
                    ?config a ldr:ReactorConfig ;
                            ldr:dataset <${datasetURI}> ;
                            ldr:scope ?scope ;
                            ?setting ?settingValue .
                            OPTIONAL { ?config rdfs:label ?label . }
                            FILTER (?setting !=rdf:type && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:constraint)
                            OPTIONAL {
                                ?config ldr:constraint ?constraint .
                                ?constraint a ldr:Constraint ;
                                ldr:property ?constraintProperty ;
                                ldr:object ?constraintObject ;
                                ldr:enabled ?constraintEnabled .
                                ?constraint ?cSetting ?cValue .
                                FILTER (?cSetting !=ldr:property && ?cSetting !=ldr:object && ?cSetting !=ldr:enabled && ?cSetting !=rdfs:label)
                            }
                ${graphEnd}
            }
            `;
            let query;
            if(userSt){
                query = `
                SELECT DISTINCT ?config ?scope ?label ?setting ?settingValue ?constraintProperty ?constraintObject ?constraintEnabled ?cSetting ?cValue WHERE {
                    ${graph}
                    {
                        ?config a ldr:ReactorConfig ;
                                ldr:dataset <${datasetURI}> ;
                                ${userSt}
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config rdfs:label ?label . }
                                FILTER (?setting !=rdf:type && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:constraint)
                                OPTIONAL {
                                    ?config ldr:constraint ?constraint .
                                    ?constraint a ldr:Constraint ;
                                    ldr:property ?constraintProperty ;
                                    ldr:object ?constraintObject ;
                                    ldr:enabled ?constraintEnabled .
                                    ?constraint ?cSetting ?cValue .
                                    FILTER (?cSetting !=ldr:property && ?cSetting !=ldr:object && ?cSetting !=ldr:enabled && ?cSetting !=rdfs:label)
                                }
                    }
                    UNION
                    {
                        ?config a ldr:ReactorConfig ;
                                ldr:dataset <${datasetURI}> ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config rdfs:label ?label . }
                                FILTER (?setting !=rdf:type && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:constraint)
                                filter not exists {
                                    ?config ldr:createdBy ?user.
                                }
                                OPTIONAL {
                                    ?config ldr:constraint ?constraint .
                                    ?constraint a ldr:Constraint ;
                                    ldr:property ?constraintProperty ;
                                    ldr:object ?constraintObject ;
                                    ldr:enabled ?constraintEnabled .
                                    ?constraint ?cSetting ?cValue .
                                    FILTER (?cSetting !=ldr:property && ?cSetting !=ldr:object && ?cSetting !=ldr:enabled && ?cSetting !=rdfs:label)
                                }
                    }
                    ${graphEnd}
                }
                `;
            }else{
                query = noAuthQuery;
            }

            //send request
            //console.log(prefixes + query);
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                //console.log(res);
                config = self.parseDatasetConfigs(config, datasetURI, res);
                //if no config was found for user in the auth mode, try to get a random config from other users
                if(userSt && !config.resultSetCount){
                    rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + noAuthQuery, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                        //console.log(res);
                        config = self.parseDatasetConfigs(config, datasetURI, res);
                        callback(config);
                    }).catch(function (err) {
                        console.log('Attempt2: Error in dataset config query:', prefixes + query);
                        console.log(sparql_endpoint_error);
                        console.log('---------------------------------------------------------');
                        callback(config);
                    });
                }else{
                    callback(config);
                }
            }).catch(function (err) {
                console.log('Error in dataset config query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }

    }
    createASampleReactorConfig(user, scope, datasetURI, resourceURI, propertyURI, options, callback) {
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicReactorConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(0);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let rnc = configDatasetURI[0] + '/rcf' + Math.round(+new Date() / 1000);
            //do not add two slashes
            if(configDatasetURI[0].slice(-1) === '/'){
                rnc = configDatasetURI[0] + 'rcf' + Math.round(+new Date() / 1000);
            }
            let datasetLabel = datasetURI;
            if(options && options.datasetLabel){
                datasetLabel = options.datasetLabel;
            }
            let resourceFocusTypeSt='';
            if(options && options.resourceFocusType){
                resourceFocusTypeSt = ` ldr:resourceFocusType <${options.resourceFocusType}> ;`;
            }
            let date = new Date();
            let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
            let st = '';
            if(scope === 'D'){
                if(options && options.fromScratch){
                    st= `
                    rdfs:label """${datasetLabel} Reactor Config""" ;
                    ldr:dataset <${datasetURI}> ;
                    ldr:datasetLabel "${datasetLabel}" ;
                    ldr:readOnly "0" ;
                    ldr:allowNewValue "1" ;
                    ldr:allowInlineConfig "0" ;
                    ldr:allowResourceClone "1" ;
                    ldr:allowPropertyDelete "1" ;
                    ldr:allowResourceNew "1" ;
                    ldr:allowPropertyNew "1" ;
                    ldr:maxNumberOfResourcesOnPage "20" ;
                    `;
                }else {
                    st= `
                    rdfs:label """${datasetLabel} Reactor Config""" ;
                    ldr:dataset <${datasetURI}> ;
                    ${resourceFocusTypeSt}
                    ldr:datasetLabel "${datasetLabel}" ;
                    ldr:maxNumberOfResourcesOnPage "20" ;
                    `;
                }
            }else if(scope === 'R'){
                st= `
                ldr:resource <${resourceURI}> ;
                `;
            }else if(scope === 'P'){
                st= `
                ldr:property <${propertyURI}> ;
                `;
            }else if(scope === 'DR'){
                st= `
                ldr:dataset <${datasetURI}> ;
                ldr:resource <${resourceURI}> ;
                `;
            }else if(scope === 'DP'){
                st= `
                ldr:dataset <${datasetURI}> ;
                ldr:property <${propertyURI}> ;
                `;
            }else if(scope === 'RP'){
                st= `
                ldr:resource <${resourceURI}> ;
                ldr:property <${propertyURI}> ;
                `;
            }else if(scope === 'DRP'){
                st= `
                ldr:dataset <${datasetURI}> ;
                ldr:resource <${resourceURI}> ;
                ldr:property <${propertyURI}> ;
                `;
            }
            const query = `
            INSERT DATA { ${graph}
                <${rnc}> a ldr:ReactorConfig ;
                         ${st}
                         ldr:createdOn "${currentDate}"^^xsd:dateTime;
                         ${userSt}
                         ldr:scope "${scope}" .
            ${graphEnd} }
            `;
            //send request
            //console.log(prefixes + query);
            let self = this;
            let HTTPQueryObject = getHTTPQuery('update', prefixes + query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                callback(rnc);
            }).catch(function (err) {
                console.log('Error in dataset config creation update query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(0);
            });
        }

    }
    createASampleServerConfig(user, datasetURI, options, callback) {
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicReactorConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(0);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let rnc = configDatasetURI[0] + '/scf' + Math.round(+new Date() / 1000);
            //do not add two slashes
            if(configDatasetURI[0].slice(-1) === '/'){
                rnc = configDatasetURI[0] + 'scf' + Math.round(+new Date() / 1000);
            }
            let date = new Date();
            let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
            const query = `
            INSERT DATA { ${graph}
                <${rnc}> a ldr:ServerConfig ;
                         ldr:dataset <${datasetURI}> ;
                         rdfs:label """${options.datasetLabel} Server Config""";
                         ldr:host """${options.host}""";
                         ldr:port """${options.port}""";
                         ldr:path """${options.path}""";
                         ldr:endpointType """${options.endpointType}""";
                         ldr:graphName """${options.graphName}""";
                         ${userSt}
                         ldr:createdOn "${currentDate}"^^xsd:dateTime .
            ${graphEnd} }
            `;
            //send request
            //console.log(prefixes + query);
            let self = this;
            let HTTPQueryObject = getHTTPQuery('update', prefixes + query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                callback(rnc);
            }).catch(function (err) {
                console.log('Error in server config creation update query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(0);
            });
        }

    }
    prepareDynamicResourceConfig(user, datasetURI, resourceURI, resourceType, callback) {
        let config = {resource: {}, dataset_resource: {}};
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicReactorConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            let typeFilter = [];
            resourceType.forEach(function(el) {
                typeFilter.push(`?resource=<${el}>`);
            });
            let typeFilterStr = '';
            if(typeFilter.length){
                typeFilterStr = '(' + typeFilter.join(' || ') + ') && ';
                //design decision: do not allow configs for resources with more than 100 type?
                // if(typeFilter.length > 100){
                //     typeFilterStr = '0 && ';
                // }

            }else{
                //do not allow treat as type when no type is defined
                typeFilterStr = '0 && ';
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let query;
            if(user){
                query = `
                SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?treatAsResourceType ?settingValue WHERE { ${graph}
                        {
                        ?config a ldr:ReactorConfig ;
                                ${userSt}
                                ldr:resource ?resource ;
                                ldr:treatAsResourceType "1" ;
                                ldr:treatAsResourceType ?treatAsResourceType ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                FILTER (${typeFilterStr}  ?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                        }
                        UNION
                        {
                        ?config a ldr:ReactorConfig ;
                                ${userSt}
                                ldr:resource <${resourceURI}> ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL { ?config ldr:treatAsResourceType ?treatAsResourceType . }
                                FILTER (?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                        }
                        UNION
                        {
                        ?config a ldr:ReactorConfig ;
                                ldr:resource ?resource ;
                                ldr:treatAsResourceType "1" ;
                                ldr:treatAsResourceType ?treatAsResourceType ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                FILTER (${typeFilterStr}  ?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                                filter not exists {
                                    ?config ldr:createdBy ?user.
                                }
                        }
                        UNION
                        {
                        ?config a ldr:ReactorConfig ;
                                ldr:resource <${resourceURI}> ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL { ?config ldr:treatAsResourceType ?treatAsResourceType . }
                                FILTER (?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                                filter not exists {
                                    ?config ldr:createdBy ?user.
                                }
                        }
                ${graphEnd}   } ORDER BY DESC(?treatAsResourceType)
                `;
            }else{
                query = `
                SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?treatAsResourceType ?settingValue WHERE { ${graph}
                        {
                        ?config a ldr:ReactorConfig ;
                                ldr:resource ?resource ;
                                ldr:treatAsResourceType "1" ;
                                ldr:treatAsResourceType ?treatAsResourceType ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                FILTER (${typeFilterStr}  ?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                        }
                        UNION
                        {
                        ?config a ldr:ReactorConfig ;
                                ldr:resource <${resourceURI}> ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                OPTIONAL { ?config rdfs:label ?label . }
                                OPTIONAL { ?config ldr:treatAsResourceType ?treatAsResourceType . }
                                FILTER (?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                        }
                ${graphEnd}   } ORDER BY DESC(?treatAsResourceType)
                `;
            }

            //send request
            //console.log(prefixes + query);
            let self = this;
            let HTTPQueryObject = getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params, headers: headers}).then(function(res){
                //console.log(res);
                config = self.parseResourceConfigs(config, resourceURI, res);
                callback(config);
            }).catch(function (err) {
                console.log('Error in resource config query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }


    }
    prepareDynamicPropertyConfig(user, datasetURI, resourceURI, resourceType, propertyURI, callback) {
        let config = {property: {}, dataset_property: {}, resource_property: {}, dataset_resource_property: {}};
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicReactorConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            //start config
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let query;
            if(userSt){
                query = `
                SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?settingValue WHERE {
                    ${graph}
                    {
                        ?config a ldr:ReactorConfig ;
                                ${userSt}
                                ldr:property <${propertyURI}> ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                OPTIONAL { ?config ldr:resource ?resource . }
                                OPTIONAL { ?config rdfs:label ?label . }
                                FILTER (?setting !=rdf:type && ?setting !=ldr:property && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:resource)
                    }
                    UNION
                    {
                        ?config a ldr:ReactorConfig ;
                                ldr:property <${propertyURI}> ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                OPTIONAL { ?config ldr:resource ?resource . }
                                OPTIONAL { ?config rdfs:label ?label . }
                                FILTER (?setting !=rdf:type && ?setting !=ldr:property && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:resource)
                                filter not exists {
                                    ?config ldr:createdBy ?user.
                                }
                    }
                    ${graphEnd}
                }
                `;
            }else{
                query = `
                SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?settingValue WHERE {
                    ${graph}
                        ?config a ldr:ReactorConfig ;
                                ldr:property <${propertyURI}> ;
                                ldr:scope ?scope ;
                                ?setting ?settingValue .
                                OPTIONAL { ?config ldr:dataset ?dataset . }
                                OPTIONAL { ?config ldr:resource ?resource . }
                                OPTIONAL { ?config rdfs:label ?label . }
                                FILTER (?setting !=rdf:type && ?setting !=ldr:property && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:resource)
                    ${graphEnd}
                }
                `;
            }

            //send request
            //console.log(prefixes + query);
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                //console.log(res);
                config = self.parsePropertyConfigs(config, propertyURI, res);
                callback(config);
            }).catch(function (err) {
                //console.log(err);
                console.log('Error in property config query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }

    }
    createASampleFacetsConfig(user, configURI, datasetURI, options, callback) {
        //do not config if disabled
        if(!enableDynamicReactorConfiguration){
            callback(1);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let date = new Date();
            let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
            let rnc = Math.round(+new Date() / 1000);
            let labelSt = ` rdfs:label "Facets Config ${rnc}" ;`;
            if(options && options.datasetLabel){
                labelSt = ` rdfs:label """${options.datasetLabel} Facets Config""" ;`;
            }
            //to add facet properties for an annotated corpus
            let annotationSt = '';
            if(options && options.annotationFacets){
                annotationSt = ` ${graph} <${configURI}> ldr:list "https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#annotations->https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#uri->http://www.w3.org/1999/02/22-rdf-syntax-ns#type" , "https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#annotations->https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#surfaceForm" ; ldr:config  <http://ld-r.org/fpct${rnc}> , <http://ld-r.org/fpcs${rnc}>.
                <http://ld-r.org/fpct${rnc}> a ldr:FacetsPropertyConfig ; ldr:label "NER Entity Types" ; rdfs:label "NER Entity Types Config ${rnc}" ; ldr:objectBrowser "TaxonomyBrowser" ; ldr:property "https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#annotations->https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#uri->http://www.w3.org/1999/02/22-rdf-syntax-ns#type" .
                <http://ld-r.org/fpcs${rnc}> a ldr:FacetsPropertyConfig ; ldr:label "NER Entities" ; rdfs:label "NER Entities config ${rnc}" ; ldr:objectBrowser "TagListBrowser" ; ldr:property "https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#annotations->https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#surfaceForm" . ${graphEnd}
                `;
            }
            const query = `
            INSERT DATA {
            ${graph}
                <${configURI}> a ldr:FacetsConfig ;
                         ldr:dataset <${datasetURI}> ;
                         ${labelSt}
                         ldr:list rdf:type ;
                         ldr:createdOn "${currentDate}"^^xsd:dateTime;
                         ${userSt}
                         ldr:config <http://ld-r.org/fpc${rnc}> .
            ${graphEnd}
            ${annotationSt}
            }
            `;
            //send request
            //console.log(prefixes + query);
            let self = this;
            let HTTPQueryObject = getHTTPQuery('update', prefixes + query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                callback(1);
            }).catch(function (err) {
                console.log('Error in sample facet config creation update query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(0);
            });
        }

    }
    createAnEnvState(user, configURI, options, callback) {
        //do not config if disabled
        if(!enableDynamicReactorConfiguration){
            callback(1);
        }else{
            let userSt = '';
            if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
                userSt=` ldr:createdBy <${user.id}> ;`;
            }
            const endpointParameters = getStaticEndpointParameters(configDatasetURI[0]);
            const graphName = endpointParameters.graphName;
            const headers = {'Accept': 'application/sparql-results+json'};
            const outputFormat = 'application/sparql-results+json';
            //query the triple store for property configs
            const prefixes = `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
            `;
            let graph = ' GRAPH <'+ graphName +'> {';
            let graphEnd = ' }';
            if(!graphName || graphName === 'default'){
                graph ='';
                graphEnd = '';
            }
            let date = new Date();
            let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
            let rnc = Math.round(+new Date() / 1000);
            let labelSt = ` rdfs:label """${options.description}""" .`;
            const query = `
            INSERT DATA {
            ${graph}
                <${configURI}> a ldr:EnvState ;
                         ldr:dataset <${options.datasetURI}> ;
                         ldr:selection """${encodeURIComponent(JSON.stringify(options.selection))}""" ;
                         ${options.pivotConstraint? 'ldr:pivotConstraint """'+encodeURIComponent(options.pivotConstraint)+'""" ;': ''}
                         ${options.searchTerm? 'ldr:searchTerm """'+options.searchTerm+'""" ;': ''}
                         ldr:resourceQuery """${encodeURIComponent(options.resourceQuery)}""" ;
                         ldr:page "${options.page}" ;
                         ldr:createdOn "${currentDate}"^^xsd:dateTime;
                         ${userSt}
                         ${labelSt}
            ${graphEnd}
            }
            `;
            //send request
            //console.log(prefixes + query);
            let self = this;
            let HTTPQueryObject = getHTTPQuery('update', prefixes + query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                callback(1);
            }).catch(function (err) {
                console.log('Error in new env state creation update query:', prefixes + query);
                console.log(sparql_endpoint_error);
                console.log('---------------------------------------------------------');
                callback(0);
            });
        }

    }
    parsePropertyConfigs(config, propertyURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        let settingProp = '';
        parsed.results.bindings.forEach(function(el) {
            settingProp = el.setting.value.replace(ldr_prefix, '').trim();
            if(el.scope.value === 'P'){
                if(!output.property[propertyURI]){
                    output.property[propertyURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.property[propertyURI][settingProp]= Number(el.settingValue.value);
                }else{
                    if(!output.property[propertyURI][settingProp]){
                        output.property[propertyURI][settingProp] = []
                    }
                    if(output.property[propertyURI][settingProp].indexOf(el.settingValue.value) === -1) {
                        output.property[propertyURI][settingProp].push(el.settingValue.value);
                    }

                }
            } else if(el.scope.value === 'DP'){
                if(!output.dataset_property[el.dataset.value]){
                    output.dataset_property[el.dataset.value] = {};
                }
                if(!output.dataset_property[el.dataset.value][propertyURI]){
                    output.dataset_property[el.dataset.value][propertyURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.dataset_property[el.dataset.value][propertyURI][settingProp] = Number(el.settingValue.value);
                }else{
                    if(!output.dataset_property[el.dataset.value][propertyURI][settingProp]){
                        output.dataset_property[el.dataset.value][propertyURI][settingProp] = [];
                    }
                    if(output.dataset_property[el.dataset.value][propertyURI][settingProp].indexOf(el.settingValue.value) === -1){
                        output.dataset_property[el.dataset.value][propertyURI][settingProp].push( el.settingValue.value);
                    }

                }

            } else if(el.scope.value === 'RP'){
                if(!output.resource_property[el.resource.value]){
                    output.resource_property[el.resource.value] = {};
                }
                if(!output.resource_property[el.resource.value][propertyURI]){
                    output.resource_property[el.resource.value][propertyURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.resource_property[el.resource.value][propertyURI][settingProp] = Number( el.settingValue.value);
                }else{
                    if(!output.resource_property[el.resource.value][propertyURI][settingProp]){
                        output.resource_property[el.resource.value][propertyURI][settingProp] = [];
                    }
                    if(output.resource_property[el.resource.value][propertyURI][settingProp].indexOf(el.settingValue.value) === -1){
                        output.resource_property[el.resource.value][propertyURI][settingProp].push( el.settingValue.value);
                    }

                }


            } else if(el.scope.value === 'DRP'){
                if(!output.dataset_resource_property[el.dataset.value]){
                    output.dataset_resource_property[el.dataset.value] = {};
                }
                if(!output.dataset_resource_property[el.dataset.value][el.resource.value]){
                    output.dataset_resource_property[el.dataset.value][el.resource.value] = {};
                }
                if(!output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI]){
                    output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][settingProp]= Number(el.settingValue.value);
                }else{
                    if(!output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][settingProp]){
                        output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][settingProp] = [];
                    }
                    if(output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][settingProp].indexOf(el.settingValue.value) === -1){
                        output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][settingProp].push(el.settingValue.value);
                    }

                }

            }
        });
        return output;
    }
    parseResourceConfigs(config, resourceURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        let settingProp = '';
        parsed.results.bindings.forEach(function(el) {
            settingProp = el.setting.value.replace(ldr_prefix, '').trim();
            if(el.scope.value === 'R'){
                if(!output.resource[resourceURI]){
                    output.resource[resourceURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.resource[resourceURI][settingProp]= Number(el.settingValue.value);
                }else{
                    if(!output.resource[resourceURI][settingProp]){
                        output.resource[resourceURI][settingProp] = []
                    }
                    output.resource[resourceURI][settingProp].push(el.settingValue.value);
                }
            } else if(el.scope.value === 'DR'){
                if(!output.dataset_resource[el.dataset.value]){
                    output.dataset_resource[el.dataset.value] = {};
                }
                if(!output.dataset_resource[el.dataset.value][resourceURI]){
                    output.dataset_resource[el.dataset.value][resourceURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.dataset_resource[el.dataset.value][resourceURI][settingProp] = Number(el.settingValue.value);
                }else{
                    if(!output.dataset_resource[el.dataset.value][resourceURI][settingProp]){
                        output.dataset_resource[el.dataset.value][resourceURI][settingProp] = [];
                    }
                    if(output.dataset_resource[el.dataset.value][resourceURI][settingProp].indexOf(el.settingValue.value) === -1){
                        output.dataset_resource[el.dataset.value][resourceURI][settingProp].push( el.settingValue.value);
                    }

                }

            }
        });
        return output;
    }
    parseDatasetConfigs(config, datasetURI, body) {
        //list of properties which should be taken into account for access management
        const viewProps = ['hasLimitedAccess', 'readOnly'];
        const editProps = ['allowResourceClone', 'allowPropertyDelete', 'allowResourceNew', 'allowPropertyNew', 'allowNewValue'];
        let output = config;
        let parsed = JSON.parse(body);
        let settingProp = '';
        let resultSetCount = parsed.results.bindings.length;
        output.resultSetCount = resultSetCount;
        parsed.results.bindings.forEach(function(el) {
            settingProp = '';
            if(el.scope.value === 'D'){
                if(!output.dataset[datasetURI]){
                    output.dataset[datasetURI] = {};
                }
                if(el.constraintProperty && el.constraintProperty.value){
                    if(el.constraintEnabled && Number(el.constraintEnabled.value)){
                        //parse only if enabled
                        if(!output.dataset[datasetURI]['constraint']){
                            output.dataset[datasetURI]['constraint'] = {}
                        }
                        //todo: it only works if only dataType is optional otherwise gives error
                        if(!output.dataset[datasetURI]['constraint'][el.constraintProperty.value]){
                            if(el.constraintObject && el.constraintObject.value){
                                if(el.cSetting && el.cSetting.value && el.cSetting.value ==='https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#dataType'){
                                    //we attach dataType to be handled in SPARQL query
                                    output.dataset[datasetURI]['constraint'][el.constraintProperty.value] = [el.constraintObject.value + '[dt]' + el.cValue.value];
                                }else{
                                    output.dataset[datasetURI]['constraint'][el.constraintProperty.value] = [el.constraintObject.value];
                                }
                            }
                        }else{
                            if(el.constraintObject && el.constraintObject.value){
                                if(el.cSetting && el.cSetting.value && el.cSetting.value ==='https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#dataType'){
                                    if(output.dataset[datasetURI]['constraint'][el.constraintProperty.value].indexOf(el.constraintObject.value + '[dt]' + el.cValue.value) === -1){
                                        output.dataset[datasetURI]['constraint'][el.constraintProperty.value].push(el.constraintObject.value + '[dt]' + el.cValue.value);
                                    }
                                }else{
                                    if(output.dataset[datasetURI]['constraint'][el.constraintProperty.value].indexOf(el.constraintObject.value) === -1){
                                        output.dataset[datasetURI]['constraint'][el.constraintProperty.value] .push(el.constraintObject.value);
                                    }
                                }
                            }
                        }
                    }
                }
                settingProp = el.setting.value.replace(ldr_prefix, '').trim();
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    if(viewProps.indexOf(settingProp) !== -1){
                        if(typeof output.dataset[datasetURI][settingProp] === 'undefined'){
                            output.dataset[datasetURI][settingProp]= Number(el.settingValue.value);
                        }else{
                            //user cannot overwrite these properties if they have 1 as value
                            output.dataset[datasetURI][settingProp]= Number(el.settingValue.value) || output.dataset[datasetURI][settingProp];
                        }
                    }else if(editProps.indexOf(settingProp) !== -1){
                        if(typeof output.dataset[datasetURI][settingProp] === 'undefined'){
                            output.dataset[datasetURI][settingProp]= Number(el.settingValue.value);
                        }else{
                            //user cannot overwrite these properties if they have 0 as value
                            output.dataset[datasetURI][settingProp]= Number(el.settingValue.value) && output.dataset[datasetURI][settingProp];
                        }
                    }else{
                        output.dataset[datasetURI][settingProp]= Number(el.settingValue.value);
                    }
                }else{
                    if(!output.dataset[datasetURI][settingProp]){
                        output.dataset[datasetURI][settingProp] = []
                    }
                    if(output.dataset[datasetURI][settingProp].indexOf (el.settingValue.value) === -1){
                        output.dataset[datasetURI][settingProp].push(el.settingValue.value);
                    }

                }
            }
        });
        return output;
    }
    parseFacetsConfigs(config, datasetURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        let settingProp = '';
        let resultSetCount = parsed.results.bindings.length;
        output.resultSetCount = resultSetCount;
        parsed.results.bindings.forEach(function(el) {
            if(!output.facets[datasetURI]){
                output.facets[datasetURI] = {};
            }
            if(!output.facets[datasetURI].list){
                output.facets[datasetURI].list = [];
            }
            if(output.facets[datasetURI].list.indexOf(el.list.value) === -1){
                output.facets[datasetURI].list.push(el.list.value);
            }
            if(!output.facets[datasetURI].config){
                output.facets[datasetURI].config = {};
            }
            if(el.configProperty){
                if(!output.facets[datasetURI].config[el.configProperty.value]){
                    output.facets[datasetURI].config[el.configProperty.value] = {};
                }
            }

            //assume that all values will be stored in an array expect numbers: Not-a-Number
            if(el.setting){
                settingProp = el.setting.value.replace(ldr_prefix, '').trim();
                if(!isNaN(el.settingValue.value)){
                    output.facets[datasetURI].config[el.configProperty.value][settingProp]= Number(el.settingValue.value);
                }else{
                    if(!output.facets[datasetURI].config[el.configProperty.value][settingProp]){
                        output.facets[datasetURI].config[el.configProperty.value][settingProp] = []
                    }
                    //do not allow duplicate labels
                    if(output.facets[datasetURI].config[el.configProperty.value][settingProp].indexOf(el.settingValue.value) === -1){
                        output.facets[datasetURI].config[el.configProperty.value][settingProp].push(el.settingValue.value);
                    }
                }
            }

        });
        return output;
    }
    parseServerConfigs(config, datasetURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        let settingProp = '', host ='';
        let resultSetCount = parsed.results.bindings.length;
        output.resultSetCount = resultSetCount;
        parsed.results.bindings.forEach(function(el) {
            if(!output.sparqlEndpoint[datasetURI]){
                output.sparqlEndpoint[datasetURI] = {};
            }
            host = el.host.value.replace('http://', '');
            //do not allow localhost on dynamic server config
            if(host === 'localhost' || host === '127.0.0.1'){
                output.sparqlEndpoint[datasetURI].host = 'example.com';
            }else{
                output.sparqlEndpoint[datasetURI].host = host;
            }
            output.sparqlEndpoint[datasetURI].port = el.port.value;
            output.sparqlEndpoint[datasetURI].path = el.path.value;
            output.sparqlEndpoint[datasetURI].endpointType = el.endpointType.value;
            //assume that all values will be stored in an array expect numbers: Not-a-Number
            settingProp = el.setting.value.replace(ldr_prefix, '').trim();
            if(!isNaN(el.settingValue.value)){
                output.sparqlEndpoint[datasetURI][settingProp]= Number(el.settingValue.value);
            }else{
                //exception for graphNameValue
                if(settingProp==='graphName'){
                    output.sparqlEndpoint[datasetURI][settingProp]= el.settingValue.value;
                }else{
                    if(!output.sparqlEndpoint[datasetURI][settingProp]){
                        output.sparqlEndpoint[datasetURI][settingProp] = []
                    }
                    output.sparqlEndpoint[datasetURI][settingProp].push(el.settingValue.value);
                }

            }

        });
        return output;
    }
    parseEnvStateConfigs(body) {
        let output = {};
        let parsed = JSON.parse(body);
        let settingProp = '';
        parsed.results.bindings.forEach(function(el) {
            settingProp = el.setting.value.replace(ldr_prefix, '').trim();
            settingProp = settingProp.replace('http://www.w3.org/2000/01/rdf-schema#', '').trim();
            if(!output[el.state.value]){
                output[el.state.value]= {};
            }
            if(!isNaN(el.settingValue.value)){
                output[el.state.value][settingProp]= Number(el.settingValue.value);
            }else{
                if(!output[el.state.value][settingProp]){
                    output[el.state.value][settingProp] = []
                }
                output[el.state.value][settingProp].push(el.settingValue.value);
            }
        });
        return output;
    }
    parseDynamicDatasets(body) {
        let dynamicReactorDS  = {dataset:{}};
        let dynamicFacetsDS = {facets:{}};
        let parsed = JSON.parse(body);
        let settingProp = '';
        parsed.results.bindings.forEach(function(el) {
            if(el.config2 && el.config2.value){
                //facets
                if(!dynamicFacetsDS.facets[el.dataset.value]){
                    dynamicFacetsDS.facets[el.dataset.value] = {};
                }
            }else{
                //reactors
                if(!dynamicReactorDS.dataset[el.dataset.value]){
                    dynamicReactorDS.dataset[el.dataset.value] = {};
                }
                if(el.setting && el.setting.value){
                    settingProp = el.setting.value.replace(ldr_prefix, '').trim();
                    if(settingProp === 'readOnly'){
                        if(typeof dynamicReactorDS.dataset[el.dataset.value][settingProp] === 'undefined'){
                            dynamicReactorDS.dataset[el.dataset.value][settingProp] = Number(el.settingValue.value);
                        }else{
                            //this is used to prevent people to switch access
                            dynamicReactorDS.dataset[el.dataset.value][settingProp] = Number(el.settingValue.value) || dynamicReactorDS.dataset[el.dataset.value][settingProp];
                        }
                    }else if(settingProp === 'hasLimitedAccess'){
                        if(typeof dynamicReactorDS.dataset[el.dataset.value][settingProp] === 'undefined'){
                            dynamicReactorDS.dataset[el.dataset.value][settingProp] = Number(el.settingValue.value);
                        }else{
                            //this is used to prevent people to switch access
                            dynamicReactorDS.dataset[el.dataset.value][settingProp] = Number(el.settingValue.value) || dynamicReactorDS.dataset[el.dataset.value][settingProp];
                        }
                    }else if(settingProp === 'position' || settingProp === 'isHidden'){
                        dynamicReactorDS.dataset[el.dataset.value][settingProp] = Number(el.settingValue.value);
                    }  else {
                        //list of relevant datasets attributes should be defined here:
                        let relatedProps = ['resourceFocusType', 'datasetLabel', 'metadata', 'datasetCategory'];
                        if(relatedProps.indexOf(settingProp) !== -1){
                            if(!dynamicReactorDS.dataset[el.dataset.value][settingProp]){
                                dynamicReactorDS.dataset[el.dataset.value][settingProp] = [];
                            }
                            if(dynamicReactorDS.dataset[el.dataset.value][settingProp].indexOf(el.settingValue.value) === -1){
                                dynamicReactorDS.dataset[el.dataset.value][settingProp].push(el.settingValue.value);
                            }
                        }
                    }
                }
            }


        });
        return {dynamicReactorDS: dynamicReactorDS, dynamicFacetsDS: dynamicFacetsDS};
    }

}
export default DynamicConfigurator;
