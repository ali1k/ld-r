import {enableDynamicReactorConfiguration, enableDynamicServerConfiguration, enableDynamicFacetsConfiguration, configDatasetURI, enableAutomaticConfiguration, authDatasetURI} from '../../configs/general';
import {getStaticEndpointParameters, getHTTPQuery, getHTTPGetURL} from '../../services/utils/helpers';
import rp from 'request-promise';

class DynamicConfigurator {
    getDynamicDatasets(callback) {
        let dynamicReactorDS  = {dataset:{}};
        let dynamicFacetsDS = {facets:{}};
        if(!enableDynamicReactorConfiguration && !enableDynamicFacetsConfiguration){
            callback(dynamicReactorDS, dynamicFacetsDS);
        }else{
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
            let query = '';
            if(enableDynamicReactorConfiguration){
                query = `
                SELECT DISTINCT ?config1 ?dataset ?datasetLabel ?readOnly ?resourceFocusType WHERE { GRAPH <${graphName}>
                        {
                        ?config1 a ldr:ReactorConfig ;
                                ldr:dataset ?dataset .
                                OPTIONAL { ?config1 ldr:datasetLabel ?datasetLabel . }
                                OPTIONAL { ?config1 ldr:readOnly ?readOnly . }
                                OPTIONAL { ?config1 ldr:resourceFocusType ?resourceFocusType . }
                        }
                }
                `;
            }
            if(enableDynamicFacetsConfiguration){
                query = `
                SELECT DISTINCT ?config2 ?dataset WHERE { GRAPH <${graphName}>
                        {
                        ?config2 a ldr:FacetsConfig ;
                                ldr:dataset ?dataset .
                        }
                }
                `;
            }
            if(enableDynamicReactorConfiguration && enableDynamicFacetsConfiguration){
                query = `
                SELECT DISTINCT ?config1 ?config2 ?dataset ?datasetLabel ?readOnly ?resourceFocusType WHERE { GRAPH <${graphName}> {
                        {
                        ?config1 a ldr:ReactorConfig ;
                                ldr:dataset ?dataset .
                                OPTIONAL { ?config1 ldr:datasetLabel ?datasetLabel . }
                                OPTIONAL { ?config1 ldr:readOnly ?readOnly . }
                                OPTIONAL { ?config1 ldr:resourceFocusType ?resourceFocusType . }
                        }
                        UNION
                        {
                        ?config2 a ldr:FacetsConfig ;
                                ldr:dataset ?dataset .
                        }
                }}
                `;
            }
            //send request
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                let tmp = self.parseDynamicDatasets(res);
                callback(tmp.dynamicReactorDS, tmp.dynamicFacetsDS);
            }).catch(function (err) {
                console.log('Error in dynamic datasets list query:', prefixes + query);
                console.log('---------------------------------------------------------');
                callback(dynamicReactorDS, dynamicFacetsDS);
            });
        }

    }
    prepareDynamicServerConfig(datasetURI, callback) {
        let config = {sparqlEndpoint: {}};
        //the following graphs shold be only locally reachable
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicServerConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
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
            const query = `
            SELECT DISTINCT ?config ?label ?host ?port ?path ?endpointType ?setting ?settingValue WHERE { GRAPH <${graphName}>
                    {
                    ?config a ldr:ServerConfig ;
                            ldr:dataset <${datasetURI}> ;
                            ldr:host ?host ;
                            ldr:port ?port ;
                            ldr:path ?path ;
                            ldr:endpointType ?endpointType ;
                            ?setting ?settingValue .
                            OPTIONAL { ?config rdfs:label ?resource . }
                            FILTER (?setting !=rdf:type && ?setting !=ldr:dataset && ?setting !=ldr:host && ?setting !=ldr:port && ?setting !=ldr:path && ?setting !=ldr:endpointType)
                    }
            }
            `;
            //send request
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                config = self.parseServerConfigs(config, datasetURI, res);
                callback(config);
            }).catch(function (err) {
                console.log('Error in server config query:', prefixes + query);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }

    }
    prepareDynamicFacetsConfig(datasetURI, callback) {
        let config = {facets: {}};
        //the following graphs shold be only locally reachable
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicFacetsConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
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
            const query = `
            SELECT DISTINCT ?config ?label ?list ?configProperty ?setting ?settingValue WHERE { GRAPH <${graphName}>
                    {
                    ?config a ldr:FacetsConfig ;
                            ldr:dataset <${datasetURI}> ;
                            ldr:list ?list ;
                            ldr:config ?facetPConfig .
                            OPTIONAL { ?config rdfs:label ?resource . }
                            ?facetsConfig ldr:property ?configProperty ;
                                          a ldr:FacetsPropertyConfig ;
                                          ?setting ?settingValue .
                            FILTER (?setting !=rdf:type && ?setting !=ldr:property)
                    }
            }
            `;
            //send request
            //console.log(prefixes + query);
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                //console.log(res);
                config = self.parseFacetsConfigs(config, datasetURI, res);
                callback(config);
            }).catch(function (err) {
                console.log('Error in facets config query:', prefixes + query);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }
    }
    prepareDynamicDatasetConfig(datasetURI, callback) {
        let config = {dataset: {}};
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicReactorConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(config);
        }else{
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
            const query = `
            SELECT DISTINCT ?config ?scope ?label ?setting ?settingValue WHERE { GRAPH <${graphName}>
                    {
                    ?config a ldr:ReactorConfig ;
                            ldr:dataset <${datasetURI}> ;
                            ldr:scope ?scope ;
                            ?setting ?settingValue .
                            OPTIONAL { ?config rdfs:label ?resource . }
                            FILTER (?setting !=rdf:type && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset)
                    }
            }
            `;
            //send request
            //console.log(prefixes + query);
            let self = this;
            rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
                //console.log(res);
                config = self.parseDatasetConfigs(config, datasetURI, res);
                callback(config);
            }).catch(function (err) {
                console.log('Error in dataset config query:', prefixes + query);
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }

    }
    prepareNewDatasetConfig(datasetURI, callback) {
        let exceptions = [configDatasetURI[0], authDatasetURI[0]];
        //do not config if disabled or exceptions
        if(!enableDynamicReactorConfiguration || exceptions.indexOf(datasetURI) !== -1){
            callback(0);
        }else{
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
            let graph = 'INTO <'+ graphName +'> ';
            if(!graphName || graphName === 'default'){
                graph ='';
            }
            let rnc = configDatasetURI[0] + '/rcf' + Math.round(+new Date() / 1000);
            //do not add two slashes
            if(configDatasetURI[0].slice(-1) === '/'){
                rnc = configDatasetURI[0] + 'rcf' + Math.round(+new Date() / 1000);
            }
            const query = `
            INSERT ${graph} {
                <${rnc}> a ldr:ReactorConfig ;
                         ldr:dataset <${datasetURI}> ;
                         ldr:scope "D" ;
                         ldr:datasetLabel "${datasetURI}" ;
                         ldr:readOnly "0" ;
                         ldr:allowResourceClone "0" ;
                         ldr:allowPropertyDelete "0" ;
                         ldr:allowResourceNew "0" ;
                         ldr:allowPropertyNew "0" ;
                         ldr:maxNumberOfResourcesOnPage "20" .
            } WHERE {

            }
            `;
            //send request
            //console.log(prefixes + query);
            let self = this;
            let HTTPQueryObject = getHTTPQuery('update', prefixes + query, endpointParameters, outputFormat);
            rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
                callback(1);
            }).catch(function (err) {
                console.log('Error in dataset config creation update query:', prefixes + query);
                console.log('---------------------------------------------------------');
                callback(0);
            });
        }

    }
    prepareDynamicResourceConfig(datasetURI, resourceURI, resourceType, callback) {
        let config = {resource: {}, dataset_resource: {}};
        //do not config if disabled
        if(!enableDynamicReactorConfiguration){
            callback(config);
        }else{
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
            const query = `
            SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?treatAsResourceType ?settingValue WHERE { GRAPH <${graphName}> {
                    {
                    ?config a ldr:ReactorConfig ;
                            ldr:resource ?resource ;
                            ldr:treatAsResourceType "1" ;
                            ldr:treatAsResourceType ?treatAsResourceType ;
                            ldr:scope ?scope ;
                            ?setting ?settingValue .
                            OPTIONAL { ?config rdfs:label ?resource . }
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
                            OPTIONAL { ?config rdfs:label ?resource . }
                            OPTIONAL { ?config ldr:treatAsResourceType ?treatAsResourceType . }
                            FILTER (?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                    }
            }   } ORDER BY DESC(?treatAsResourceType)
            `;
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
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }


    }
    prepareDynamicPropertyConfig(datasetURI, resourceURI, resourceType, propertyURI, callback) {
        let config = {property: {}, dataset_property: {}, resource_property: {}, dataset_resource_property: {}};
        //do not config if disabled
        if(!enableDynamicReactorConfiguration){
            callback(config);
        }else{
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
            const query = `
            SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?settingValue WHERE { GRAPH <${graphName}>
                    {
                    ?config a ldr:ReactorConfig ;
                            ldr:property <${propertyURI}> ;
                            ldr:scope ?scope ;
                            ?setting ?settingValue .
                            OPTIONAL { ?config ldr:dataset ?dataset . }
                            OPTIONAL { ?config ldr:resource ?resource . }
                            OPTIONAL { ?config rdfs:label ?label . }
                            FILTER (?setting !=rdf:type && ?setting !=ldr:property && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:resource)
                    }
            }
            `;
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
                console.log('---------------------------------------------------------');
                callback(config);
            });
        }

    }
    parsePropertyConfigs(config, propertyURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            if(el.scope.value === 'P'){
                if(!output.property[propertyURI]){
                    output.property[propertyURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.property[propertyURI][el.setting.value.split('#')[1]]= parseInt(el.settingValue.value);
                }else{
                    if(!output.property[propertyURI][el.setting.value.split('#')[1]]){
                        output.property[propertyURI][el.setting.value.split('#')[1]] = []
                    }
                    if(output.property[propertyURI][el.setting.value.split('#')[1]].indexOf() === -1) {
                        output.property[propertyURI][el.setting.value.split('#')[1]].push(el.settingValue.value);
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
                    output.dataset_property[el.dataset.value][propertyURI][el.setting.value.split('#')[1]] = parseInt(el.settingValue.value);
                }else{
                    if(!output.dataset_property[el.dataset.value][propertyURI][el.setting.value.split('#')[1]]){
                        output.dataset_property[el.dataset.value][propertyURI][el.setting.value.split('#')[1]] = [];
                    }
                    if(output.dataset_property[el.dataset.value][propertyURI][el.setting.value.split('#')[1]].indexOf(el.settingValue.value) === -1){
                        output.dataset_property[el.dataset.value][propertyURI][el.setting.value.split('#')[1]].push( el.settingValue.value);
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
                    output.resource_property[el.resource.value][propertyURI][el.setting.value.split('#')[1]] = parseInt( el.settingValue.value);
                }else{
                    if(!output.resource_property[el.resource.value][propertyURI][el.setting.value.split('#')[1]]){
                        output.resource_property[el.resource.value][propertyURI][el.setting.value.split('#')[1]] = [];
                    }
                    if(output.resource_property[el.resource.value][propertyURI][el.setting.value.split('#')[1]].indexOf() === -1){
                        output.resource_property[el.resource.value][propertyURI][el.setting.value.split('#')[1]].push( el.settingValue.value);
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
                    output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][el.setting.value.split('#')[1]]= parseInt(el.settingValue.value);
                }else{
                    if(!output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][el.setting.value.split('#')[1]]){
                        output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][el.setting.value.split('#')[1]] = [];
                    }
                    if(output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][el.setting.value.split('#')[1]].indexOf() === -1){
                        output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][el.setting.value.split('#')[1]].push(el.settingValue.value);
                    }

                }

            }
        });
        return output;
    }
    parseResourceConfigs(config, resourceURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            if(el.scope.value === 'R'){
                if(!output.resource[resourceURI]){
                    output.resource[resourceURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.resource[resourceURI][el.setting.value.split('#')[1]]= parseInt(el.settingValue.value);
                }else{
                    if(!output.resource[resourceURI][el.setting.value.split('#')[1]]){
                        output.resource[resourceURI][el.setting.value.split('#')[1]] = []
                    }
                    output.resource[resourceURI][el.setting.value.split('#')[1]].push(el.settingValue.value);
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
                    output.dataset_resource[el.dataset.value][resourceURI][el.setting.value.split('#')[1]] = parseInt(el.settingValue.value);
                }else{
                    if(!output.dataset_resource[el.dataset.value][resourceURI][el.setting.value.split('#')[1]]){
                        output.dataset_resource[el.dataset.value][resourceURI][el.setting.value.split('#')[1]] = [];
                    }
                    if(output.dataset_resource[el.dataset.value][resourceURI][el.setting.value.split('#')[1]].indexOf() === -1){
                        output.dataset_resource[el.dataset.value][resourceURI][el.setting.value.split('#')[1]].push( el.settingValue.value);
                    }

                }

            }
        });
        return output;
    }
    parseDatasetConfigs(config, datasetURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            if(el.scope.value === 'D'){
                if(!output.dataset[datasetURI]){
                    output.dataset[datasetURI] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.dataset[datasetURI][el.setting.value.split('#')[1]]= parseInt(el.settingValue.value);
                }else{
                    if(!output.dataset[datasetURI][el.setting.value.split('#')[1]]){
                        output.dataset[datasetURI][el.setting.value.split('#')[1]] = []
                    }
                    if(output.dataset[datasetURI][el.setting.value.split('#')[1]].indexOf (el.settingValue.value) === -1){
                        output.dataset[datasetURI][el.setting.value.split('#')[1]].push(el.settingValue.value);
                    }

                }
            }
        });
        return output;
    }
    parseFacetsConfigs(config, datasetURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
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
            if(!output.facets[datasetURI].config[el.configProperty.value]){
                output.facets[datasetURI].config[el.configProperty.value] = {};
            }
            //assume that all values will be stored in an array expect numbers: Not-a-Number
            if(!isNaN(el.settingValue.value)){
                output.facets[datasetURI].config[el.configProperty.value][el.setting.value.split('#')[1]]= parseInt(el.settingValue.value);
            }else{
                if(!output.facets[datasetURI].config[el.configProperty.value][el.setting.value.split('#')[1]]){
                    output.facets[datasetURI].config[el.configProperty.value][el.setting.value.split('#')[1]] = []
                }
                //do not allow duplicate labels
                if(output.facets[datasetURI].config[el.configProperty.value][el.setting.value.split('#')[1]].indexOf(el.settingValue.value) === -1){
                    output.facets[datasetURI].config[el.configProperty.value][el.setting.value.split('#')[1]].push(el.settingValue.value);
                }
            }

        });
        return output;
    }
    parseServerConfigs(config, datasetURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            if(!output.sparqlEndpoint[datasetURI]){
                output.sparqlEndpoint[datasetURI] = {};
            }
            output.sparqlEndpoint[datasetURI].host = el.host.value;
            output.sparqlEndpoint[datasetURI].port = el.port.value;
            output.sparqlEndpoint[datasetURI].path = el.path.value;
            output.sparqlEndpoint[datasetURI].endpointType = el.endpointType.value;
            //assume that all values will be stored in an array expect numbers: Not-a-Number

            if(!isNaN(el.settingValue.value)){
                output.sparqlEndpoint[datasetURI][el.setting.value.split('#')[1]]= parseInt(el.settingValue.value);
            }else{
                //exception for graphNameValue
                if(el.setting.value.split('#')[1]==='graphName'){
                    output.sparqlEndpoint[datasetURI][el.setting.value.split('#')[1]]= el.settingValue.value;
                }else{
                    if(!output.sparqlEndpoint[datasetURI][el.setting.value.split('#')[1]]){
                        output.sparqlEndpoint[datasetURI][el.setting.value.split('#')[1]] = []
                    }
                    output.sparqlEndpoint[datasetURI][el.setting.value.split('#')[1]].push(el.settingValue.value);
                }

            }

        });
        return output;
    }
    parseDynamicDatasets(body) {
        let dynamicReactorDS  = {dataset:{}};
        let dynamicFacetsDS = {facets:{}};
        let parsed = JSON.parse(body);
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
                if(el.datasetLabel && el.datasetLabel.value){
                    if(!dynamicReactorDS.dataset[el.dataset.value].datasetLabel){
                        dynamicReactorDS.dataset[el.dataset.value].datasetLabel = [];
                    }
                    if(dynamicReactorDS.dataset[el.dataset.value].datasetLabel.indexOf(el.datasetLabel.value) === -1){
                        dynamicReactorDS.dataset[el.dataset.value].datasetLabel.push(el.datasetLabel.value);
                    }
                }
                if(el.resourceFocusType && el.resourceFocusType.value){
                    if(!dynamicReactorDS.dataset[el.dataset.value].resourceFocusType){
                        dynamicReactorDS.dataset[el.dataset.value].resourceFocusType = [];
                    }
                    if(dynamicReactorDS.dataset[el.dataset.value].resourceFocusType.indexOf(el.resourceFocusType.value) === -1){
                        dynamicReactorDS.dataset[el.dataset.value].resourceFocusType.push(el.resourceFocusType.value);
                    }
                }
                if(el.readOnly && el.readOnly.value){
                    dynamicReactorDS.dataset[el.dataset.value].readOnly = parseInt(el.readOnly.value);
                }
            }


        });
        return {dynamicReactorDS: dynamicReactorDS, dynamicFacetsDS: dynamicFacetsDS};
    }

}
export default DynamicConfigurator;
