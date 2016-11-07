'use strict';
import async from 'async';
import Configurator from './Configurator';
class ResourceUtil {
    getPropertyLabel(uri) {
        var property = '';
        var tmp = uri;
        var tmp2 = tmp.split('#');
        if (tmp2.length > 1) {
            property = tmp2[1];
        } else {
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
            tmp2 = property.split(':');
            property = tmp2[tmp2.length - 1];
        }
        //make first letter capital case
        property = property.charAt(0).toUpperCase() + property.slice(1);
        return property;
    }
    parseProperties(body, datasetURI, resourceURI, category, propertyPath, callback) {
        let configurator = new Configurator();
        let configExceptional = {},
            config = {},
            title = '',
            resourceType = [];
        let filterByCategory = 0,
            self = this;
        let parsed = JSON.parse(body);
        let output = [],
            propIndex = {},
            finalOutput = [];
        if (!parsed.results || !parsed.results.bindings || !parsed.results.bindings.length || parsed.head.vars[0] === 'callret-0') {
            //no results!
            //return [];
            callback( {
                props: [],
                title: '',
                resourceType: [],
                rconfig: {}
            });
        }
        let rpIndex = this.buildResourcePropertyIndex(parsed.results.bindings);
        title = rpIndex.title;
        resourceType = rpIndex.resourceType;
        //resource config
        configurator.prepareResourceConfig(1, datasetURI, resourceURI, resourceType, (rconfig)=> {
            if (rconfig.usePropertyCategories) {
                //allow filter by category
                if (!category) {
                    //get first category as default
                    category = rconfig.propertyCategories[0];
                }
                filterByCategory = 1;
            }
            let asyncTasks = [];
            //handle properties config in different levels
            //todo: now only handles level 2 properties should be extended later if needed
            if (propertyPath && propertyPath.length) {
                asyncTasks.push(function(callback){
                    //it is only for property path
                    configurator.preparePropertyConfig(1, datasetURI, resourceURI, resourceType, propertyPath[1], (res)=> {
                        configExceptional = res;
                        callback();
                    });
                });
            }
            for(let propURI in rpIndex.propIndex){
                asyncTasks.push(function(callback2){
                    configurator.preparePropertyConfig(1, datasetURI, resourceURI, resourceType, propURI, (config)=> {
                        //handle categories

                        if (filterByCategory) {
                            if (!config || !config.category || category !== config.category[0]) {
                                //skip property
                                callback2();
                            }else{
                                let property = self.getPropertyLabel(propURI);
                                output.push({
                                    propertyURI: propURI,
                                    property: property,
                                    instances: rpIndex.propIndex[propURI],
                                    config: config
                                });
                                callback2();
                            }
                        }else{
                            let property = self.getPropertyLabel(propURI);
                            output.push({
                                propertyURI: propURI,
                                property: property,
                                instances: rpIndex.propIndex[propURI],
                                config: config
                            });
                            callback2();
                        }

                    });
                });
            }
            let modifiedConfig;
            //run all tasks in parallel
            async.parallelLimit(asyncTasks, 10, ()=>{
                output.forEach(function(el) {
                    modifiedConfig = el.config;
                    //overwrite configs if extensions are provided
                    if (configExceptional && configExceptional.extensions) {
                        configExceptional.extensions.forEach(function(ex) {
                            if (ex.spec.propertyURI === el.propertyURI) {
                                for (let cp in ex.config) {
                                    //overwrite config with extension config
                                    modifiedConfig[cp] = ex.config[cp];
                                }
                            }
                        });
                    }
                    finalOutput.push({
                        propertyURI: el.propertyURI,
                        property: el.property,
                        config: modifiedConfig,
                        instances: el.instances
                    });
                });
                //make the right title for resource if propertyLabel is defined in config
                let newTitel = title;
                if (rconfig && rconfig.resourceLabelProperty && rconfig.resourceLabelProperty.length) {
                    newTitel = '';
                    let tmpArr = [];
                    finalOutput.forEach(function(el) {
                        if (rconfig.resourceLabelProperty.indexOf(el.propertyURI) !== -1) {
                            tmpArr.push(el.instances[0].value);
                        }
                    });
                    if (tmpArr.length) {
                        newTitel = tmpArr.join('-');
                    } else {
                        newTitel = title;
                    }
                }
                callback( {
                    props: finalOutput,
                    title: newTitel,
                    resourceType: resourceType,
                    rconfig: rconfig
                });
            });
        });

    }
    buildResourcePropertyIndex(bindings) {
        let propIndex = {};
        let output= {propIndex: propIndex, title: '', resourceType: []};
        bindings.forEach(function(el) {
            //see if we can find a suitable title for resource
            if (el.p.value === 'http://purl.org/dc/terms/title') {
                output.title = el.o.value;
            } else if (el.p.value === 'http://www.w3.org/2000/01/rdf-schema#label') {
                output.title = el.o.value;
            } else if (el.p.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                output.resourceType.push(el.o.value);
            }
            //group by properties
            //I put the valueType into instances because we might have cases (e.g. subject property) in which for different instances, we have different value types
            if (propIndex[el.p.value]) {
                propIndex[el.p.value].push({
                    value: el.o.value,
                    valueType: el.o.type,
                    dataType: (el.o.type === 'typed-literal' ? el.o.datatype : ''),
                    extended: parseInt(el.hasExtendedValue.value)
                });
            } else {
                propIndex[el.p.value] = [{
                    value: el.o.value,
                    valueType: el.o.type,
                    dataType: (el.o.type === 'typed-literal' ? el.o.datatype : ''),
                    extended: parseInt(el.hasExtendedValue.value)
                }];
            }
            output.propIndex = propIndex;
        });
        return output;
    }
    buildConfigFromExtensions(extensions) {
        let config = {};
        extensions.forEach(function(el, i) {
            config[el.spec.propertyURI] = el.config;
        });
        return config;
    }
    findExtensionIndex(extensions, propertyURI) {
        let index = -1;
        extensions.forEach(function(el, i) {
            if (el.spec.propertyURI === propertyURI) {
                index = i;
            }
        });
        return index;
    }
    getExtensionConfig(extensions, propertyURI) {
        let index = this.findExtensionIndex(extensions, propertyURI);
        if (index === -1) {
            return {};
        }
        return extensions[index].config;
    }
    parseObjectProperties(body, datasetURI, resourceURI, propertyURI, callback) {
        let title, objectType = '';
        let configurator = new Configurator();
        let config = {};
        configurator.preparePropertyConfig(1, datasetURI, resourceURI, 0, propertyURI, (configExceptional)=> {
            let self = this;
            let parsed = JSON.parse(body);
            let output = [],
                propIndex = {},
                finalOutput = [], asyncTasks = [];
            if (parsed.results.bindings.length) {
                parsed.results.bindings.forEach(function(el) {
                    asyncTasks.push(function(callback){
                        configurator.preparePropertyConfig(1, datasetURI, resourceURI, 0, el.p.value, (config)=> {
                            if (el.p.value === 'http://purl.org/dc/terms/title') {
                                title = el.o.value;
                            } else if (el.p.value === 'http://www.w3.org/2000/01/rdf-schema#label') {
                                title = el.o.value;
                            } else if (el.p.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                                objectType = el.o.value;
                            }
                            if (configExceptional && configExceptional.extensions) {
                                configExceptional.extensions.forEach(function(ex) {
                                    if (ex.spec.propertyURI === el.p.value) {
                                        for (let cp in ex.config) {
                                            //overwrite config with extension config
                                            config[cp] = ex.config[cp];
                                        }
                                    }
                                });
                            }
                            let property = self.getPropertyLabel(el.p.value);
                            if (propIndex[el.p.value]) {
                                propIndex[el.p.value].push({
                                    value: el.o.value,
                                    valueType: el.o.type,
                                    dataType: (el.o.type === 'typed-literal' ? el.o.datatype : ''),
                                    extended: parseInt(el.hasExtendedValue.value)
                                });
                            } else {
                                propIndex[el.p.value] = [{
                                    value: el.o.value,
                                    valueType: el.o.type,
                                    dataType: (el.o.type === 'typed-literal' ? el.o.datatype : ''),
                                    extended: parseInt(el.hasExtendedValue.value)
                                }];
                            }
                            output.push({
                                propertyURI: el.p.value,
                                property: property,
                                instances: [],
                                config: config
                            });
                            callback();
                        });
                    });
                });
                //run all tasks in parallel
                async.parallelLimit(asyncTasks, 10, function(){
                    output.forEach(function(el) {
                        if (propIndex[el.propertyURI]) {
                            finalOutput.push({
                                config: el.config,
                                spec: {
                                    propertyURI: el.propertyURI,
                                    property: el.property,
                                    instances: propIndex[el.propertyURI]
                                }
                            });
                            propIndex[el.propertyURI] = null;
                        }
                    });
                    callback({
                        props: finalOutput,
                        title: title,
                        objectType: objectType
                    });
                });
            }
        });

    }
        //------ permission check functions---------------
    deleteAdminProperties(list) {
        let out = []
        const adminProps = ['https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isSuperUser', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isActive', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfDataset', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfResource', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfProperty', 'http://purl.org/dc/terms/created'];
        list.forEach(function(el) {
            if (adminProps.indexOf(el.propertyURI) === -1) {
                out.push(el);
            }
        });
        return out;
    }
    includesProperty(list, resource, property) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource && el.p === property) {
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource, property) {
        if (parseInt(user.isSuperUser)) {
            return {
                access: true,
                type: 'full'
            };
        } else {
            if (graph && user.editorOfDataset.indexOf(graph) !== -1) {
                return {
                    access: true,
                    type: 'full'
                };
            } else {
                if (resource && user.editorOfResource.indexOf(resource) !== -1) {
                    return {
                        access: true,
                        type: 'full'
                    };
                } else {
                    if (property && this.includesProperty(user.editorOfProperty, resource, property)) {
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
    }
    //--------------------------------------------------------
}
export default ResourceUtil;
