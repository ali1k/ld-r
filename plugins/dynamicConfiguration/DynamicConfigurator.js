import {enableDynamicConfiguration, configGraphName, disableAutomaticConfiguration} from '../../configs/general';
import {getEndpointParameters, getHTTPQuery, getHTTPGetURL} from '../../services/utils/helpers';
import rp from 'request-promise';

class DynamicConfigurator {
    prepareDynamicPropertyConfig(graphName, resourceURI, resourceType, propertyURI) {
        let config = {property: {}, dataset_property: {}, resource_property: {}, dataset_resource_property: {}};
        //do not config if disabled
        if(!enableDynamicConfiguration){
            return config;
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
            return config;
        }).catch(function (err) {
            console.log(err);
            return config;
        });
        return config;
    }
    parsePropertyConfigs(config, propertyURI, body) {
        let output = config;
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            if(el.scope.value === 'P'){
                if(!output.property[propertyURI]){
                    output.property[propertyURI] = {};
                }
                output.property[propertyURI][el.setting.value.split('#')[1]] = el.settingValue.value;
            } else if(el.scope.value === 'DP'){
                if(!output.dataset_property[el.dataset.value]){
                    output.dataset_property[el.dataset.value] = {};
                }
                if(!output.dataset_property[el.dataset.value][propertyURI]){
                    output.dataset_property[el.dataset.value][propertyURI] = {};
                }
                output.dataset_property[el.dataset.value][propertyURI][el.setting.value.split('#')[1]] = el.settingValue.value;

            } else if(el.scope.value === 'RP'){
                if(!output.resource_property[el.resource.value]){
                    output.resource_property[el.resource.value] = {};
                }
                if(!output.resource_property[el.resource.value][propertyURI]){
                    output.resource_property[el.resource.value][propertyURI] = {};
                }
                output.resource_property[el.resource.value][propertyURI][el.setting.value.split('#')[1]] = el.settingValue.value;

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

                output.dataset_resource_property[el.dataset.value][el.resource.value][propertyURI][el.setting.value.split('#')[1]] = el.settingValue.value;
            }
        });
        return output;
    }

}
export default DynamicConfigurator;
