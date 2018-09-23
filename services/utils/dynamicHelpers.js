import {sparqlEndpoint} from '../../configs/server';
import {defaultDatasetURI} from '../../configs/general';
import DynamicConfigurator from '../../plugins/dynamicConfiguration/DynamicConfigurator';
import CSVMapper from '../../plugins/import/CSVMapper';
let dynamicConfigurator = new DynamicConfigurator();
let csvMapper = new CSVMapper();
let prepareDGFunc = function (user, datasetURI, callback){
    let d = datasetURI, g = datasetURI, options = {};
    //try default graph if no datasetURI is given
    if(String(defaultDatasetURI[0]) !==''){
        if(!d) {
            d = defaultDatasetURI[0];
        }
    }
    dynamicConfigurator.prepareDynamicServerConfig(user, d, (dynamicConfig)=> {
        if(sparqlEndpoint[d]){
            options = sparqlEndpoint[d];
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
            //do not allow to override server configs by dynamic ones
            if(dynamicConfig.sparqlEndpoint[d]){
                if(dynamicConfig.sparqlEndpoint[d].graphName){
                    g = dynamicConfig.sparqlEndpoint[d].graphName;
                    options = dynamicConfig.sparqlEndpoint[d];
                }else{
                    g = d;
                    options = dynamicConfig.sparqlEndpoint[d];
                }
            }else{
                //go for generic SPARQL endpoint
                options = sparqlEndpoint['generic'];
                if(sparqlEndpoint['generic'].graphName){
                    g = sparqlEndpoint['generic'].graphName;
                }else{
                    g = d;
                }
                d = 'generic';
            }

        }
        callback ({d: d, g: g, options: options});
    });
}
export default {
    getDynamicEndpointParameters: function(user, datasetURI, callback) {
        prepareDGFunc(user, datasetURI, (config)=> {
            let httpOptions;
            let d = config.d;
            let g = config.g;

            httpOptions = {
                host: config.options.host,
                port: config.options.port,
                path: config.options.path,
                protocol: config.options.protocol,
                username: config.options.username,
                password: config.options.password,
            };
            let useReasoning = 0;
            if(config.options.useReasoning){
                useReasoning = 1;
            }
            let etype = config.options.endpointType ? config.options.endpointType : 'virtuoso';
            callback ({httpOptions: httpOptions, type: etype.toLowerCase(), graphName: g, useReasoning: useReasoning});
        });

    },
    getDynamicFacetsConfig: function(user, datasetURI, callback) {
        dynamicConfigurator.prepareDynamicFacetsConfig(user, datasetURI, (dynamicConfig)=> {
            callback(dynamicConfig);
        });
    },
    getDynamicDatasetConfig: function(user, datasetURI, callback) {
        dynamicConfigurator.prepareDynamicDatasetConfig(user, datasetURI, (dynamicConfig)=> {
            callback(dynamicConfig);
        });
    },
    getDynamicDatasets: function(user, callback) {
        dynamicConfigurator.getDynamicDatasets(user, (dynamicReactorDS, dynamicFacetsDS)=> {
            callback(dynamicReactorDS, dynamicFacetsDS);
        });
    },
    createASampleServerConfig: function(user, datasetURI, options, callback) {
        dynamicConfigurator.createASampleServerConfig(user, datasetURI, options, (res)=> {
            callback(res);
        });
    },
    createASampleReactorConfig: function(user, scope, datasetURI, resourceURI, propertyURI, options, callback) {
        dynamicConfigurator.createASampleReactorConfig(user, scope, datasetURI, resourceURI, propertyURI, options, (res)=> {
            callback(res);
        });
    },
    createASampleFacetsConfig: function(user, configURI, datasetURI, options, callback) {
        dynamicConfigurator.createASampleFacetsConfig(user, configURI, datasetURI, options, (res)=> {
            callback(res);
        });
    },
    createAnEnvState: function(user, configURI, options, callback) {
        dynamicConfigurator.createAnEnvState(user, configURI, options, (res)=> {
            callback(res);
        });
    },
    getSavedQueries: function(user, callback) {
        dynamicConfigurator.getSavedQueries(user, (res)=> {
            callback(res);
        });
    },
    createASampleMapping: function(user, filePath, delimiter, columns, options, callback) {
        csvMapper.createASampleMapping(user, filePath, delimiter, columns, options, (res)=> {
            callback(res);
        });
    },
    getJSONLDConfig: function(resourceURI, options, callback) {
        csvMapper.getJSONLDConfig(resourceURI, options, (res)=> {
            callback(res);
        });
    }
}
