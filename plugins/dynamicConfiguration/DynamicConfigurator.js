import {enableDynamicConfiguration, configGraphName, disableAutomaticConfiguration} from '../../configs/general';
import {getEndpointParameters, getHTTPQuery, getHTTPGetURL} from '../../services/utils/helpers';
import rp from 'request-promise';

class DynamicConfigurator {
    prepareDynamicDatasetConfig(graphName, callback) {
        let config = {dataset: {}};
        //do not config if disabled
        if(!enableDynamicConfiguration){
            callback(config);
        }
        //start config
        //query the triple store for property configs
        const prefixes = `
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
        `;
        const query = `
        SELECT DISTINCT ?config ?scope ?label ?setting ?settingValue WHERE { GRAPH <${configGraphName}>
                {
                ?config a ldr:ReactorConfig ;
                        ldr:dataset <${graphName}> ;
                        ldr:scope ?scope ;
                        rdfs:label ?label ;
                        ?setting ?settingValue .
                        FILTER (?setting !=rdf:type && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset)
                }
        }
        `;
        const endpointParameters = getEndpointParameters(configGraphName);
        const headers = {'Accept': 'application/sparql-results+json'};
        const outputFormat = 'application/sparql-results+json';
        //send request
        //console.log(prefixes + query);
        let self = this;
        rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
            //console.log(res);
            config = self.parseDatasetConfigs(config, graphName, res);
            callback(config);
        }).catch(function (err) {
            console.log('Error in dataset config query:', prefixes + query);
            console.log('---------------------------------------------------------');
            callback(config);
        });
    }
    prepareDynamicResourceConfig(graphName, resourceURI, resourceType, callback) {
        let config = {resource: {}, dataset_resource: {}};
        //do not config if disabled
        if(!enableDynamicConfiguration){
            callback(config);
        }
        let typeFilter = [];
        resourceType.forEach(function(el) {
            typeFilter.push(`?resource=<${el}>`);
        });
        let typeFilterStr = '';
        if(typeFilter.length){
            //design decision: do not allow configs for resources with more than 20 type
            if(typeFilter.length < 20){
                typeFilterStr = '(' + typeFilter.join(' || ') + ') && ';
            }else{
                typeFilterStr = '0 && ';
            }

        }else{
            //do not allow treat as type when no type is defined
            typeFilterStr = '0 && ';
        }
        //start config
        //query the triple store for property configs
        const prefixes = `
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
        `;
        const query = `
        SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?treatAsResourceType ?settingValue WHERE { GRAPH <${configGraphName}> {
                {
                ?config a ldr:ReactorConfig ;
                        ldr:resource ?resource ;
                        ldr:treatAsResourceType "1" ;
                        ldr:treatAsResourceType ?treatAsResourceType ;
                        ldr:scope ?scope ;
                        rdfs:label ?label ;
                        ?setting ?settingValue .
                        OPTIONAL { ?config ldr:dataset ?dataset . }
                        FILTER (${typeFilterStr}  ?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                }
                UNION
                {
                ?config a ldr:ReactorConfig ;
                        ldr:resource <${resourceURI}> ;
                        ldr:scope ?scope ;
                        rdfs:label ?label ;
                        ?setting ?settingValue .
                        OPTIONAL { ?config ldr:dataset ?dataset . }
                        OPTIONAL { ?config ldr:treatAsResourceType ?treatAsResourceType . }
                        FILTER (?setting!=rdf:type && ?setting!=ldr:scope && ?setting!=rdfs:label && ?setting!=ldr:dataset && ?setting!=ldr:resource && ?setting!=ldr:treatAsResourceType)
                }
        }   } ORDER BY DESC(?treatAsResourceType)
        `;
        const endpointParameters = getEndpointParameters(configGraphName);
        const headers = {'Accept': 'application/sparql-results+json'};
        const outputFormat = 'application/sparql-results+json';
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
    prepareDynamicPropertyConfig(graphName, resourceURI, resourceType, propertyURI, callback) {
        let config = {property: {}, dataset_property: {}, resource_property: {}, dataset_resource_property: {}};
        //do not config if disabled
        if(!enableDynamicConfiguration){
            callback(config);
        }
        //start config
        //query the triple store for property configs
        const prefixes = `
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
        `;
        const query = `
        SELECT DISTINCT ?config ?scope ?label ?setting ?dataset ?resource ?settingValue WHERE { GRAPH <${configGraphName}>
                {
                ?config a ldr:ReactorConfig ;
                        ldr:property <${propertyURI}> ;
                        ldr:scope ?scope ;
                        rdfs:label ?label ;
                        ?setting ?settingValue .
                        OPTIONAL { ?config ldr:dataset ?dataset . }
                        OPTIONAL { ?config ldr:resource ?resource . }
                        FILTER (?setting !=rdf:type && ?setting !=ldr:property && ?setting !=ldr:scope && ?setting !=rdfs:label && ?setting !=ldr:dataset && ?setting !=ldr:resource)
                }
        }
        `;
        const endpointParameters = getEndpointParameters(configGraphName);
        const headers = {'Accept': 'application/sparql-results+json'};
        const outputFormat = 'application/sparql-results+json';
        //send request
        //console.log(prefixes + query);
        let self = this;
        rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
            //console.log(res);
            config = self.parsePropertyConfigs(config, propertyURI, res);
            callback(config);
        }).catch(function (err) {
            console.log('Error in property config query:', prefixes + query);
            console.log('---------------------------------------------------------');
            callback(config);
        });
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
                    output.property[propertyURI][el.setting.value.split('#')[1]].push(el.settingValue.value);
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
                    output.dataset_property[el.dataset.value][propertyURI][el.setting.value.split('#')[1]].push( el.settingValue.value);
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
                    output.resource_property[el.resource.value][propertyURI][el.setting.value.split('#')[1]].push( el.settingValue.value);
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
                    output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][el.setting.value.split('#')[1]].push(el.settingValue.value);
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
                    output.dataset_resource[el.dataset.value][resourceURI][el.setting.value.split('#')[1]].push( el.settingValue.value);
                }

            }
        });
        return output;
    }
    parseDatasetConfigs(config, graphName, body) {
        let output = config;
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            if(el.scope.value === 'D'){
                if(!output.dataset[graphName]){
                    output.dataset[graphName] = {};
                }
                //assume that all values will be stored in an array expect numbers: Not-a-Number
                if(!isNaN(el.settingValue.value)){
                    output.dataset[graphName][el.setting.value.split('#')[1]]= parseInt(el.settingValue.value);
                }else{
                    if(!output.dataset[graphName][el.setting.value.split('#')[1]]){
                        output.dataset[graphName][el.setting.value.split('#')[1]] = []
                    }
                    output.dataset[graphName][el.setting.value.split('#')[1]].push(el.settingValue.value);
                }
            }
        });
        return output;
    }

}
export default DynamicConfigurator;
