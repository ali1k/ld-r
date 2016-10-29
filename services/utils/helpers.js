import {sparqlEndpoint} from '../../configs/server';
import validUrl from 'valid-url';
import queryString from 'query-string';
export default {
    getHTTPOptions: function(graphName) {
        let httpOptions, g;
        if(sparqlEndpoint[graphName]){
            g = graphName;
        }else{
            //go for generic SPARQL endpoint
            g = 'generic';
        }
        httpOptions = {
          host: sparqlEndpoint[g].host,
          port: sparqlEndpoint[g].port,
          path: sparqlEndpoint[g].path
        };
        return httpOptions;
    },
    getEndpointParameters: function(graphName) {
        let httpOptions, g;
        if(sparqlEndpoint[graphName]){
            g = graphName;
        }else{
            //go for generic SPARQL endpoint
            g = 'generic';
        }
        httpOptions = {
          host: sparqlEndpoint[g].host,
          port: sparqlEndpoint[g].port,
          path: sparqlEndpoint[g].path
        };
        let useDefaultGraph = 0;
        if(sparqlEndpoint[g].useDefaultGraph){
            useDefaultGraph = 1;
        }
        let useReasoning = 0;
        if(sparqlEndpoint[g].useReasoning){
            useReasoning = 1;
        }
        let etype = sparqlEndpoint[g].type ? sparqlEndpoint[g].type : 'virtuoso';
        return {httpOptions: httpOptions, type: etype, useDefaultGraph: useDefaultGraph, useReasoning: useReasoning};
    },
    //build the write URI and params for different SPARQL endpoints
    getHTTPQuery: function(mode, query, endpointParameters, outputFormat) {
        let outputObject = {url: '', params: {}};

        if(endpointParameters.useReasoning){
            outputObject.params['reasoning'] = 'true';
        }

        switch (endpointParameters.type) {
        case 'virtuoso':

            outputObject.url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
            outputObject.params['query'] = query;
            outputObject.params['format'] = outputFormat;

            break;
        case 'stardog':
            outputObject.url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
            outputObject.params['query'] = query;
            outputObject.params['Accept'] = outputFormat;

            break;
        //todo: check the differences for other triple stores
        case 'sesame':
            if(mode === 'update'){
                ext = '';
                outputObject.url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + '/statements';
                outputObject.params['update'] = query;
            }else{
                outputObject.params['query'] = query;
                outputObject.url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
                outputObject.params['Accept'] = outputFormat;
            }

            break;
        }
        return outputObject;
    },
    ///builds the HTTP get URL for SPARQL requests
    getHTTPGetURL(object){
        let url = object.url + '?' + queryString.stringify(object.params);
        return url;
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
