'use strict';
import async from 'async';
import Configurator from './Configurator';
import {checkEditAccess} from './accessManagement';
function compareProps(a,b) {
    if (a.property < b.property)
        return -1;
    if (a.property > b.property)
        return 1;
    return 0;
}
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
    parseProperties(user, body, datasetURI, resourceURI, category, propertyPath, callback) {
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
        configurator.prepareResourceConfig(user, 1, datasetURI, resourceURI, resourceType, (rconfig)=> {
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
                    configurator.preparePropertyConfig(user, 1, datasetURI, resourceURI, resourceType, propertyPath[1], (res)=> {
                        configExceptional = res;
                        callback();
                    });
                });
            }
            for(let propURI in rpIndex.propIndex){
                asyncTasks.push(function(callback2){
                    configurator.preparePropertyConfig(user, 1, datasetURI, resourceURI, resourceType, propURI, (dconfig)=> {
                        //handle categories

                        if (filterByCategory) {
                            if (!dconfig || !dconfig.category || category !== dconfig.category[0]) {
                                //skip property
                                callback2();
                            }else{
                                let property = self.getPropertyLabel(propURI);
                                output.push({
                                    propertyURI: propURI,
                                    property: property,
                                    instances: rpIndex.propIndex[propURI],
                                    config: dconfig
                                });
                                callback2();
                            }
                        }else{
                            let property = self.getPropertyLabel(propURI);
                            output.push({
                                propertyURI: propURI,
                                property: property,
                                instances: rpIndex.propIndex[propURI],
                                config: dconfig
                            });
                            callback2();
                        }

                    });
                });
            }
            let userIsEditor = 0, checkEditorship;
            if(user){
                checkEditorship=checkEditAccess(user, datasetURI, resourceURI, resourceType, 0);
                if(checkEditorship.access && checkEditorship.type === 'full'){
                    userIsEditor = 1;
                }
            }
            let modifiedConfig, accessLevel, userIsCreator=0;
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
                    if(user){
                        if(el.propertyURI==='https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdBy' && user.id === el.instances[0].value) {
                            userIsCreator = 1;
                        }
                        accessLevel=checkEditAccess(user, datasetURI, resourceURI, resourceType, el.propertyURI);
                        modifiedConfig.access =accessLevel.access;
                    }

                    finalOutput.push({
                        propertyURI: el.propertyURI,
                        property: el.property,
                        config: modifiedConfig,
                        instances: el.instances
                    });
                });
                //sort final output in a consistent way
                finalOutput.sort(compareProps);
                //handle permissions
                if(userIsCreator || userIsEditor){
                    finalOutput.forEach(function(el) {
                        if(!el.config.readOnlyProperty){
                            el.config.readOnly = 0;
                            delete el.config.access;
                        }else {
                            el.config.readOnly = 1;
                        }
                    });
                }else{
                    finalOutput.forEach(function(el) {
                        if(!el.config.readOnlyProperty){
                            el.config.readOnly = el.config.access ? 0 : 1;
                            delete el.config.access;
                        }else {
                            el.config.readOnly = 1;
                        }
                    });
                }
                //make the right title for resource if propertyLabel is defined in config
                let newTitel = title;
                if(rconfig){
                    rconfig.userIsCreator = userIsCreator;
                    rconfig.userIsEditor = userIsEditor;
                    if (rconfig.resourceLabelProperty && rconfig.resourceLabelProperty.length) {
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
                    lang: el.o['xml:lang'] ? el.o['xml:lang'] : '',
                    extended: parseInt(el.hasExtendedValue.value),
                    valueLabel: el.oLabel ? el.oLabel.value : '',
                    valueTitle: el.oTitle ? el.oTitle.value : ''
                });
            } else {
                propIndex[el.p.value] = [{
                    value: el.o.value,
                    valueType: el.o.type,
                    dataType: (el.o.type === 'typed-literal' ? el.o.datatype : ''),
                    lang: el.o['xml:lang'] ? el.o['xml:lang'] : '',
                    extended: parseInt(el.hasExtendedValue.value),
                    valueLabel: el.oLabel ? el.oLabel.value : '',
                    valueTitle: el.oTitle ? el.oTitle.value : ''
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
    parseObjectProperties(user, body, datasetURI, resourceURI, propertyURI, callback) {
        let title, objectType = '';
        let configurator = new Configurator();
        let config = {};
        configurator.preparePropertyConfig(user, 1, datasetURI, resourceURI, 0, propertyURI, (configExceptional)=> {
            let self = this;
            let parsed = JSON.parse(body);
            let output = [],
                propIndex = {},
                finalOutput = [], asyncTasks = [];
            if (parsed.results.bindings.length) {
                parsed.results.bindings.forEach(function(el) {
                    asyncTasks.push(function(callback){
                        configurator.preparePropertyConfig(user, 1, datasetURI, resourceURI, 0, el.p.value, (dconfig)=> {
                            config = configurator.cloneConfig(dconfig);
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
                                    lang: el.o['xml:lang'] ? el.o['xml:lang'] : '',
                                    extended: parseInt(el.hasExtendedValue.value),
                                    valueLabel: el.oLabel ? el.oLabel.value : '',
                                    valueTitle: el.oTitle ? el.oTitle.value : ''
                                });
                            } else {
                                propIndex[el.p.value] = [{
                                    value: el.o.value,
                                    valueType: el.o.type,
                                    dataType: (el.o.type === 'typed-literal' ? el.o.datatype : ''),
                                    lang: el.o['xml:lang'] ? el.o['xml:lang'] : '',
                                    extended: parseInt(el.hasExtendedValue.value),
                                    valueLabel: el.oLabel ? el.oLabel.value : '',
                                    valueTitle: el.oTitle ? el.oTitle.value : ''
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
                    //sort final output in a consistent way
                    output.sort(compareProps);
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
        const adminProps = ['https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isSuperUser', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isActive', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOf', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#viewerOf'];
        list.forEach(function(el) {
            if (adminProps.indexOf(el.propertyURI) === -1) {
                out.push(el);
            }
        });
        return out;
    }
    //--------------------------------------------------------
}
export default ResourceUtil;
