import {sparqlEndpoint} from '../../configs/server';
import validUrl from 'valid-url';
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
    getHTTPQuery: function(mode, query, endpointParameters, outputFormat) {
        let url, output = '&Accept=' + encodeURIComponent(outputFormat), ext ='';
        let qParam= 'query';
        if(mode === 'update'){
            ext = '/statements';
            qParam = 'update';
            output= '';
        }
        let reasoningParam = '';
        if(endpointParameters.useReasoning){
            reasoningParam= '&reasoning=true';
        }
        switch (endpointParameters.type) {
            case 'virtuoso':
                url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat) + reasoningParam;
            break;
            case 'sesame':
                url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + ext + '?' + qParam + '=' + encodeURIComponent(query) + reasoningParam + output;
            break;
        }
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
