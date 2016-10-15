'use strict';
import {config} from '../../configs/reactor';

class Configurator{
    constructor() {
        this.config = config;
    }
    cloneConfig(a) {
       return JSON.parse(JSON.stringify(a));
    }
    //collects the generic config based on the depth provided
    prepareGenericConfig(depth) {
       let config = this.cloneConfig(this.config);
       let output = {};
       if(depth < 1 || depth > 4){
           return output;
       }
       output = config.dataset.generic;
       if(depth > 1){
           for(let prop in config.resource.generic) {
               output[prop] = config.resource.generic[prop];
           }
       }
       if(depth > 2){
           for(let prop in config.property.generic) {
               output[prop] = config.property.generic[prop];
           }
       }
       if(depth > 3){
           for(let prop in config.object.generic) {
               output[prop] = config.object.generic[prop];
           }
       }
       return output;
    }
    prepareDatasetConfig(useGeneric, graphName) {
        let config = this.cloneConfig(this.config);
        //default config comes from generic dataset
        let output = {};
        if(useGeneric){
            output = this.prepareGenericConfig(1);
        }
        if(config.dataset[graphName]){
            //there is a user-defined config, overwrite default config then
            for(let prop in config.dataset[graphName]) {
                output[prop] = config.dataset[graphName][prop];
            }
        }
        return output;
    }
    prepareResourceConfig(useGeneric, graphName, resourceURI, resourceType) {
        if(!Array.isArray(resourceType)){
            resourceType=[resourceType];
        }
        let config = this.cloneConfig(this.config);
        let output = {};
        //get the generic resource config
        if(useGeneric){
            output = this.prepareGenericConfig(2);
        }
        //get the dataset config
        let tmp = this.prepareDatasetConfig(0, graphName);
        for(let prop in tmp) {
            output[prop] = tmp[prop];
        }
        //go to user-defined scopes
        //it goes from less-specific to most-specific config
        //check resource Type scope as well
        for(let res in config.resource) {
            if(config.resource[res].treatAsResourceType){
                if(resourceType.indexOf(res) !== -1){
                    for(let prop in config.resource[res]) {
                        output[prop] = config.resource[res][prop];
                    }
                }
            }
        }
        if(config.resource[resourceURI]){
            for(let prop in config.resource[resourceURI]) {
                output[prop] = config.resource[resourceURI][prop];
            }
        }
        if(config.dataset_resource[graphName]){
            if(config.dataset_resource[graphName][resourceURI]){
                //apply config on resource URI
                for(let prop in config.dataset_resource[graphName][resourceURI]) {
                    output[prop] = config.dataset_resource[graphName][resourceURI][prop];
                }
            }else{
                //check if there is config on resource type
                //apply config on a specific resource type
                for(let res in config.dataset_resource[graphName]) {
                    if(config.dataset_resource[graphName][res].treatAsResourceType){
                        if(resourceType.indexOf(res) !== -1){
                            for(let prop in config.dataset_resource[graphName][res]) {
                                output[prop] = config.dataset_resource[graphName][res][prop];
                            }
                        }
                    }
                }
            }
        }
        let finalOutput = {};
        //remove irrelevant attributes from config
        let irrels = ['resourceFocusType', 'maxNumberOfResourcesOnPage', 'datasetReactor'];
        for(let prop in output) {
            if(irrels.indexOf(prop) === -1) {
                finalOutput[prop] = output[prop];
            }
        }
        return finalOutput;
    }
    preparePropertyConfig(useGeneric, graphName, resourceURI, resourceType, propertyURI) {
        if(!Array.isArray(resourceType)){
            resourceType=[resourceType];
        }
        let config = this.cloneConfig(this.config);
        let output = {};
        if(useGeneric){
            output = this.prepareGenericConfig(3);
        }
        //first we need to get upper level configs that come from resource config
        let tmp = this.prepareResourceConfig(0, graphName, resourceURI, resourceType);
        //owerwrite generic ones
        for(let prop in tmp) {
            output[prop] = tmp[prop];
        }
        if(config.property[propertyURI]){
            for(let prop in config.property[propertyURI]) {
                output[prop] = config.property[propertyURI][prop];
            }
        }
        if(config.dataset_property[graphName]){
            if(config.dataset_property[graphName][propertyURI]){
                for(let prop in config.dataset_property[graphName][propertyURI]) {
                    output[prop] = config.dataset_property[graphName][propertyURI][prop];
                }
            }
        }
        if(config.resource_property[resourceURI]){
            if(config.resource_property[resourceURI][propertyURI]){
                for(let prop in config.resource_property[resourceURI][propertyURI]) {
                    output[prop] = config.resource_property[resourceURI][propertyURI][prop];
                }
            }
        }
        if(config.dataset_resource_property[graphName]){
            if(config.dataset_resource_property[graphName][resourceURI]){
                if(config.dataset_resource_property[graphName][resourceURI][propertyURI]){
                    for(let prop in config.dataset_resource_property[graphName][resourceURI][propertyURI]) {
                        output[prop] = config.dataset_resource_property[graphName][resourceURI][propertyURI][prop];
                    }
                }
            }
        }
        let finalOutput = {};
        //remove irrelevant attributes from config
        let irrels = ['resourceFocusType', 'maxNumberOfResourcesOnPage', 'datasetReactor', 'usePropertyCategories', 'propertyCategories', 'resourceReactor', 'treatAsResourceType'];
        for(let prop in output) {
            if(irrels.indexOf(prop) == -1) {
                finalOutput[prop] = output[prop];
            }
        }
        return finalOutput;
    }
    prepareObjectConfig(useGeneric, graphName, resourceURI, propertyURI, objectValue) {
        //todo: it is not yet completely implemented because we are not sure about the possible use case
        //it has to go through 15 scopes which causes an overhead if unnecessary
        //we can easily implement this if needed in future so that users can have components in the scope of objects
        //for now, we only add one check for object data types which makes sense in some scenarios
        let config = this.cloneConfig(this.config);
        let output = {};
        //collect the generic config
        if(useGeneric){
            output = this.prepareGenericConfig(4);
        }
        let tmp = this.preparePropertyConfig(0, graphName, resourceURI, resourceType, propertyURI);
        //owerwrite generic ones
        for(let prop in tmp) {
            output[prop] = tmp[prop];
        }
        //todo-----
        //traverese object configs
        //-------
        let finalOutput = {};
        //remove irrelevant attributes from config
        let irrels = ['propertyReactor', 'objectReactor', 'objectIViewer', 'objectIEditor', 'extendedOEditor', 'extendedOViewer'];
        for(let prop in output) {
            if(irrels.indexOf(prop) == -1) {
                finalOutput[prop] = output[prop];
            }
        }
        return finalOutput;
    }
    getResourceFocusType(graphName){
        let out = {'type':[], 'labelProperty': []};
        if(config.dataset[graphName] && config.dataset[graphName].resourceFocusType){
            out['type'] = config.dataset[graphName].resourceFocusType;
            if(config.dataset[graphName].resourceLabelProperty && config.dataset[graphName].resourceLabelProperty.length){
                out['labelProperty'] = config.dataset[graphName].resourceLabelProperty;
            }
        }
        return out;
    }
}
export default Configurator;
