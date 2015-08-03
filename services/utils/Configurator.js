'use strict';
import {config} from '../../configs/reactor';
class Configurator{
    constructor() {
        this.config = config;
    }
    cloneConfig(a) {
       return JSON.parse(JSON.stringify(a));
    }
    prepareDatasetConfig(graphName) {
        let config = this.cloneConfig(this.config);
        //default config
        let output = config.dataset.generic;
        if(config.dataset[graphName]){
            //there is a user-defined config, overwrite default config then
            for(let prop in config.dataset[graphName]) {
                output[prop] = config.dataset[graphName][prop];
            }
        }
        return output;
    }
    prepareResourceConfig(graphName, resourceURI, resourceType) {
        let config = this.cloneConfig(this.config);
        //default config
        let output = config.dataset.generic;
        for(let prop in config.resource.generic) {
            output[prop] = config.resource.generic[prop];
        }
        //go to user-defined scopes
        //it goes from less-specific to most-specific config
        if(config.dataset[graphName]){
            for(let prop in config.dataset[graphName]) {
                output[prop] = config.dataset[graphName][prop];
            }
        }
        //check resource Type scope as well
        for(let res in config.resource) {
            if(config.resource[res].treatAsResourceType){
                if(resourceType === res){
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
                        if(resourceType === res){
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
    preparePropertyConfig(graphName, resourceURI, resourceType, propertyURI) {
        let config = this.cloneConfig(this.config);
        //default config
        let output = config.dataset.generic;
        for(let prop in config.resource.generic) {
            output[prop] = config.resource.generic[prop];
        }
        for(let prop in config.property.generic) {
            output[prop] = config.property.generic[prop];
        }
        //go to user-defined scopes
        //it goes from less-specific to most-specific config
        if(config.dataset[graphName]){
            for(let prop in config.dataset[graphName]) {
                output[prop] = config.dataset[graphName][prop];
            }
        }
        //check resource Type scope as well
        for(let res in config.resource) {
            if(config.resource[res].treatAsResourceType){
                if(resourceType === res){
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
                        if(resourceType === res){
                            for(let prop in config.dataset_resource[graphName][res]) {
                                output[prop] = config.dataset_resource[graphName][res][prop];
                            }
                        }
                    }
                }
            }
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
    prepareObjectConfig(graphName, resourceURI, propertyURI, objectValue) {
        //todo: it is not yet implemented because we are not sure about the possible use case
        //it has to go through 15 scopes which causes an overhead if unnecessary
        //we can easily implement this if needed in future so that users can have components in the scope of objects
    }
}
export default Configurator;
