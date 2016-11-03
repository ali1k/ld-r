import {sparqlEndpoint} from '../../configs/server';
import {defaultGraphName} from '../../configs/general';
import validUrl from 'valid-url';
import queryString from 'query-string';
//todo: get config from dynamic configs: not allow overwriting auth and config graphs data
let prepareDGFunc = function (datasetURI){
    let d = datasetURI, g = datasetURI;
    //try default graph if no datasetURI is given
    if(!d && String(defaultGraphName[0]) !==''){
        d = defaultGraphName[0];
        g = defaultGraphName[0];
    }
    if(sparqlEndpoint[d]){
        if(sparqlEndpoint[d].graphName){
            g = sparqlEndpoint[d].graphName;
        }else{
            g = d;
        }
    }else{
        //go for generic SPARQL endpoint
        if(sparqlEndpoint['generic'].graphName){
            g = sparqlEndpoint['generic'].graphName;
        }else{
            g = d;
        }
        d = 'generic';
    }
    return {d: d, g: g};
}

export default {
    //returns dataset and graphName
    prepareDG: function (datasetURI){
        return prepareDGFunc(datasetURI);
    },
    getHTTPOptions: function(datasetURI) {
        let httpOptions, {d, g} = prepareDGFunc(datasetURI);
        httpOptions = {
            host: sparqlEndpoint[d].host,
            port: sparqlEndpoint[d].port,
            path: sparqlEndpoint[d].path
        };
        return httpOptions;
    },
    getEndpointParameters: function(datasetURI) {
        let httpOptions, {d, g} = prepareDGFunc(datasetURI);
        httpOptions = {
            host: sparqlEndpoint[d].host,
            port: sparqlEndpoint[d].port,
            path: sparqlEndpoint[d].path
        };
        let useReasoning = 0;
        if(sparqlEndpoint[d].useReasoning){
            useReasoning = 1;
        }
        let etype = sparqlEndpoint[d].type ? sparqlEndpoint[d].type : 'virtuoso';
        return {httpOptions: httpOptions, type: etype, graphName: g, useReasoning: useReasoning};
    },
    //build the write URI and params for different SPARQL endpoints
    getHTTPQuery: function(mode, query, endpointParameters, outputFormat) {
        let outputObject = {uri: '', params: {}};

        if(endpointParameters.useReasoning){
            outputObject.params['reasoning'] = 'true';
        }

        switch (endpointParameters.type) {
        case 'virtuoso':

            outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
            outputObject.params['query'] = query;
            outputObject.params['format'] = outputFormat;

            break;
        case 'stardog':
            outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
            outputObject.params['query'] = query;
            outputObject.params['Accept'] = outputFormat;

            break;
        //todo: check the differences for other triple stores
        case 'sesame':
            if(mode === 'update'){
                ext = '';
                outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + '/statements';
                outputObject.params['update'] = query;
            }else{
                outputObject.params['query'] = query;
                outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
                outputObject.params['Accept'] = outputFormat;
            }

            break;
        }
        return outputObject;
    },
    ///builds the HTTP get URL for SPARQL requests
    getHTTPGetURL(object){
        let uri = object.uri + '?' + queryString.stringify(object.params);
        return uri;
    },
    getQueryDataTypeValue(valueType, dataType, objectValue) {
        let newValue, dtype;
        switch (valueType) {
        case 'uri':
        case 'bnode':
            newValue='<'+objectValue+'>';
            dtype = 'uri';
            break;
        case 'literal':
            // automatically detect uris even in literal values
            if(validUrl.is_web_uri(objectValue.toString())){
                newValue='<'+objectValue+'>';
                dtype = 'uri';
            }else{
                newValue='"""'+objectValue+'"""';
                dtype = 'str';
            }
            break;
        case 'typed-literal':
        //handle typed-literal values
            switch (dataType) {
            case 'http://www.w3.org/2001/XMLSchema#integer':
                dtype = 'xsd:integer';
                newValue='"'+objectValue+'"^^' + dtype;
                break;
            case 'http://www.w3.org/2001/XMLSchema#decimal':
                dtype = 'xsd:decimal';
                newValue='"'+objectValue+'"^^' + dtype;
                break;
            case 'http://www.w3.org/2001/XMLSchema#float':
                dtype = 'xsd:float';
                newValue='"'+objectValue+'"^^' + dtype;
                break;
            case 'http://www.w3.org/2001/XMLSchema#double':
                dtype = 'xsd:double';
                newValue='"'+objectValue+'"^^' + dtype;
                break;
            case 'http://www.w3.org/2001/XMLSchema#dateTime':
                dtype = 'xsd:dateTime';
                newValue='"'+objectValue+'"^^' + dtype;
                break;
            case 'http://www.w3.org/2001/XMLSchema#date':
                dtype = 'xsd:date';
                newValue='"'+objectValue+'"^^' + dtype;
                break;
            case 'http://www.w3.org/2001/XMLSchema#boolean':
                dtype = 'xsd:boolean';
                newValue='"'+objectValue+'"^^' + dtype;
                break;
            default:
                newValue='"""'+objectValue+'"""';
                dtype = 'str';
            }
            break;
        default:
            // default: handle as string
            newValue='"""'+objectValue+'"""';
            dtype = 'str';
        }
        //fix in virtuoso
        if(dtype === 'uri'){
            dtype = 'iri';
        }
        return {dtype: dtype, value: newValue};
    }
}
