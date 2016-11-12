import {sparqlEndpoint} from '../../configs/server';
import {defaultDatasetURI} from '../../configs/general';
import DynamicConfigurator from '../../plugins/dynamicConfiguration/DynamicConfigurator';
let dynamicConfigurator = new DynamicConfigurator();
let prepareDGFunc = function (datasetURI, callback){
    let d = datasetURI, g = datasetURI, options = {};
    //try default graph if no datasetURI is given
    if(String(defaultDatasetURI[0]) !==''){
        if(!d) {
            d = defaultDatasetURI[0];
        }
    }
    dynamicConfigurator.prepareDynamicServerConfig(d, (dynamicConfig)=> {
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
            if(dynamicConfig.sparqlEndpoint[d] && dynamicConfig.sparqlEndpoint[d].graphName){
                g = dynamicConfig.sparqlEndpoint[d].graphName;
                options = dynamicConfig.sparqlEndpoint[d];
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
    getDynamicEndpointParameters: function(datasetURI, callback) {
        prepareDGFunc(datasetURI, (config)=> {

            let httpOptions;
            let d = config.d;
            let g = config.g;

            httpOptions = {
                host: config.options.host,
                port: config.options.port,
                path: config.options.path
            };
            let useReasoning = 0;
            if(config.options.useReasoning){
                useReasoning = 1;
            }
            let etype = config.options.endpointType ? config.options.endpointType : 'virtuoso';
            callback ({httpOptions: httpOptions, type: etype.toLowerCase(), graphName: g, useReasoning: useReasoning});
        });

    },
    getDynamicFacetsConfig: function(datasetURI, callback) {
        dynamicConfigurator.prepareDynamicFacetsConfig(datasetURI, (dynamicConfig)=> {
            callback(dynamicConfig);
        });
    },
    getDynamicDatasetConfig: function(datasetURI, callback) {
        dynamicConfigurator.prepareDynamicDatasetConfig(datasetURI, (dynamicConfig)=> {
            callback(dynamicConfig);
        });
    },
    getDynamicDatasets: function(callback) {
        dynamicConfigurator.getDynamicDatasets((dynamicReactorDS, dynamicFacetsDS)=> {
            callback(dynamicReactorDS, dynamicFacetsDS);
        });
    },
    prepareNewDatasetConfig: function(datasetURI, callback) {
        dynamicConfigurator.prepareNewDatasetConfig(datasetURI, (res)=> {
            callback(res);
        });
    }
}
