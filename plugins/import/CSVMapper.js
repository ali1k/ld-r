import {enableCSVImport, mappingsDatasetURI, baseResourceDomain} from '../../configs/general';
import {getStaticEndpointParameters, getHTTPQuery, getHTTPGetURL} from '../../services/utils/helpers';
import rp from 'request-promise';
import camelCase from 'camelcase';
const ldr_prefix = 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#';
const sparql_endpoint_error = '**Please also check if the mapping SPARQL endpoint is running and is updateable**';

class CSVMapper {
    createJSONLD(resourceURI, options, callback) {
        const endpointParameters = getStaticEndpointParameters(mappingsDatasetURI[0]);
        const graphName = endpointParameters.graphName;
        const headers = {'Accept': 'application/sparql-results+json'};
        const outputFormat = 'application/sparql-results+json';
        let graph = ' GRAPH <'+ graphName +'> {';
        let graphEnd = ' }';
        if(!graphName || graphName === 'default'){
            graph ='';
            graphEnd = '';
        }
        //query the triple store for mapping configs
        const prefixes = `
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
        `;
        const query = `
        SELECT DISTINCT ?setting ?settingValue ?cm WHERE {
            ${graph}
                <${resourceURI}> ?setting ?settingValue ;
                                 ldr:customMappings ?cm .
                FILTER (?setting !=ldr:customMappings && ?setting !=rdf:type && ?setting !=rdfs:label && ?setting !=ldr:createdOn)
            ${graphEnd}
        }
        `;
        //console.log(query);
        //send request
        let self = this;
        rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + query, endpointParameters, outputFormat)), headers: headers}).then(function(res){
            let parsed = JSON.parse(res);
            //custom Mapping uri
            let customMappingURI = 0;
            if(parsed.results.bindings.length && parsed.results.bindings[0].cm){
                customMappingURI = parsed.results.bindings[0].cm.value;
            }
            if(customMappingURI){
                const subquery = `
                SELECT DISTINCT ?source ?target WHERE {
                    ${graph}
                        <${customMappingURI}> ?source ?target .
                        FILTER (?source !=rdf:type)
                    ${graphEnd}
                }
                `;
                //console.log(subquery);
                rp.get({uri: getHTTPGetURL(getHTTPQuery('read', prefixes + subquery, endpointParameters, outputFormat)), headers: headers}).then(function(res2){
                    let confs = self.parseCSVConfigs(res, res2);
                    callback(confs);
                }).catch(function (err2) {
                    console.log('Error in custom mappings config query:', prefixes + subquery);
                    console.log(sparql_endpoint_error);
                    console.log('---------------------------------------------------------');
                    callback({});
                });
            }
        }).catch(function (err) {
            console.log('Error in general mappings config query:', prefixes + query);
            console.log(sparql_endpoint_error);
            console.log('---------------------------------------------------------');
            callback({});
        });
    }
    parseCSVConfigs(body, body2) {
        let output = {};
        let parsed1 = JSON.parse(body);
        let parsed2 = JSON.parse(body2);
        let settingProp = '';
        parsed1.results.bindings.forEach(function(el) {
            console.log(el);
        });
        parsed2.results.bindings.forEach(function(el) {
            console.log(el);
        });
        return output;
    }
    createASampleMapping(user, filePath, delimiter, columns, options, callback) {
        let userSt = '';
        if(user && user.accountName !== 'open' && !Number(user.isSuperUser)){
            userSt=` ldr:createdBy <${user.id}> ;`;
        }
        //start config
        const endpointParameters = getStaticEndpointParameters(mappingsDatasetURI[0]);
        const graphName = endpointParameters.graphName;
        const headers = {'Accept': 'application/sparql-results+json'};
        const outputFormat = 'application/sparql-results+json';
        let graph = ' GRAPH <'+ graphName +'> {';
        let graphEnd = ' }';
        if(!graphName || graphName === 'default'){
            graph ='';
            graphEnd = '';
        }
        let resourcePrefix = baseResourceDomain[0] + '/r/';
        let vocabPrefix = baseResourceDomain[0] + '/v/';
        let rnc = resourcePrefix + Math.round(+new Date() / 1000);
        //do not add two slashes
        if(baseResourceDomain[0].slice(-1) === '/'){
            resourcePrefix = baseResourceDomain[0] + 'r/';
            vocabPrefix = baseResourceDomain[0] + 'v/';
            rnc = resourcePrefix + Math.round(+new Date() / 1000);
        }
        let cmRND = 'cm' + Math.round(+new Date() / 1000);
        let date = new Date();
        let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
        //query the triple store for adding configs
        const prefixes = `
            PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            PREFIX r: <${resourcePrefix}>
            PREFIX v: <${vocabPrefix}>
        `;
        let customMappings = columns.map((item, itemc)=> {
            return `v:${camelCase(item)}_mapTo v:${camelCase(item)} ;`;
        });
        const query = `
        INSERT DATA { ${graph}
            <${rnc}> a ldr:CSVMapping ;
                     ldr:csvFile <${filePath}> ;
                     rdfs:label "mapping configurations for ${filePath}" ;
                     ldr:delimiter """${delimiter}""";
                     ldr:entityType v:Entity ;
                     rdfs:IDColumn v:${camelCase(columns[0])};
                     ldr:SkippedColumns v:${camelCase(columns[0])};
                     ldr:customMappings r:${cmRND};
                     ${userSt}
                     ldr:createdOn "${currentDate}"^^xsd:dateTime .
                     r:${cmRND} ${customMappings.join(' ')}
                     a ldr:CustomMapping .
        ${graphEnd} }
        `;
        //ToDO, add also a configuration for the above resource
        //send request
        //console.log(prefixes + query);
        let self = this;
        let HTTPQueryObject = getHTTPQuery('update', prefixes + query, endpointParameters, outputFormat);
        rp.post({uri: HTTPQueryObject.uri, form: HTTPQueryObject.params}).then(function(res){
            callback(rnc);
        }).catch(function (err) {
            console.log('Error in mapping config creation update query:', prefixes + query);
            console.log(sparql_endpoint_error);
            console.log('---------------------------------------------------------');
            callback(0);
        });
    }
}
export default CSVMapper;
