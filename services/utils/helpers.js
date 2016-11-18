import {sparqlEndpoint} from '../../configs/server';
import {defaultDatasetURI, enableDynamicServerConfiguration, enableAuthentication} from '../../configs/general';
import validUrl from 'valid-url';
import queryString from 'query-string';

let prepareStaticDGFunc = (datasetURI)=>{
    let d = datasetURI, g = datasetURI;
    //try default graph if no datasetURI is given
    if(String(defaultDatasetURI[0]) !==''){
        if(!d) {
            d = defaultDatasetURI[0];
        }
    }
    if(sparqlEndpoint[d]){
        if(sparqlEndpoint[d].graphName){
            g = sparqlEndpoint[d].graphName;
        }else{
            if(d === 'generic'){
                g = 'default';
            }else{
                g = d;
            }
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

let includesProperty = (list, resource, property)=> {
    let out = false;
    list.forEach(function(el) {
        if (el.r === resource && el.p === property) {
            out = true;
            return out;
        }
    });
    return out;
}

export default {
    //returns dataset and graphName
    prepareDG(datasetURI){
        return prepareStaticDGFunc(datasetURI);
    },
    //it is used for users and configs
    getStaticEndpointParameters(datasetURI){
        let httpOptions, {d, g} = prepareStaticDGFunc(datasetURI);
        httpOptions = {
            host: sparqlEndpoint[d].host,
            port: sparqlEndpoint[d].port,
            path: sparqlEndpoint[d].path
        };
        let useReasoning = 0;
        if(sparqlEndpoint[d].useReasoning){
            useReasoning = 1;
        }
        let etype = sparqlEndpoint[d].endpointType ? sparqlEndpoint[d].endpointType : 'virtuoso';
        return {httpOptions: httpOptions, type: etype.toLowerCase(), graphName: g, useReasoning: useReasoning};
    },
    //build the write URI and params for different SPARQL endpoints
    getHTTPQuery(mode, query, endpointParameters, outputFormat) {
        let outputObject = {uri: '', params: {}};

        if(endpointParameters.useReasoning){
            outputObject.params['reasoning'] = 'true';
        }

        switch (endpointParameters.type.toLowerCase()) {
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
        case 'cliopatria':
            if(mode === 'update'){
                outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + 'update';
                outputObject.params['update'] = query;
            }else{
                outputObject.params['query'] = query;
                outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
                outputObject.params['format'] = outputFormat;
            }

            break;
        //todo: check the differences for other triple stores
        case 'sesame':
            if(mode === 'update'){
                outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + '/statements';
                outputObject.params['update'] = query;
            }else{
                outputObject.params['query'] = query;
                outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
                outputObject.params['Accept'] = outputFormat;
            }

            break;
        default:
            outputObject.uri = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path;
            outputObject.params['query'] = query;
            outputObject.params['format'] = outputFormat;
        }
        return outputObject;
    },
    ///builds the HTTP get URL for SPARQL requests
    getHTTPGetURL(object){
        let uri = object.uri + '?' + queryString.stringify(object.params);
        return uri;
    },
    prepareGraphName(graphName){
        let gStart = 'GRAPH <'+ graphName +'> { ';
        let gEnd = ' } ';
        if(!graphName || graphName === 'default'){
            gStart =' ';
            gEnd = ' ';
        }
        return {gStart: gStart, gEnd: gEnd}
    },
    checkAccess(user, graph, resource, property) {
        if(!enableAuthentication){
            return {
                access: true,
                type: 'full'
            };            
        }
        if (parseInt(user.isSuperUser)) {
            return {
                access: true,
                type: 'full'
            };
        } else {
            if (graph && user.editorOfDataset && user.editorOfDataset.indexOf(graph) !== -1) {
                return {
                    access: true,
                    type: 'full'
                };
            } else {
                if (resource && user.editorOfResource && user.editorOfResource.indexOf(resource) !== -1) {
                    return {
                        access: true,
                        type: 'full'
                    };
                } else {
                    if (property && user.editorOfProperty && includesProperty(user.editorOfProperty, resource, property)) {
                        return {
                            access: true,
                            type: 'partial'
                        };
                    } else {
                        return {
                            access: false
                        };
                    }
                }
            }
        }
    },
    getQueryDataTypeValue(valueType, dataType, objectValue) {
        let newValue, dtype;
        switch (valueType) {
        case 'uri':
        case 'bnode':
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
