'use strict';
import {propertiesConfig} from '../../configs/reactor';
class ResourceUtil{
    getPropertyLabel(uri) {
        var property='';
        var tmp=uri;
        var tmp2=tmp.split('#');
        if(tmp2.length>1){
            property=tmp2[1];
        }else{
            tmp2=tmp.split('/');
            property=tmp2[tmp2.length-1];
        }
        return property;
    }
    parseProperties(body, graphName, category, propertyPath) {
        let title = '', selectedConfig, rightConfig, resourceType = '';
        //first check if there is a specific config for the property on the selected graphName
        selectedConfig = propertiesConfig[graphName];
        //if no specific config is found, get the generic config
        if(!selectedConfig){
            selectedConfig = propertiesConfig.generic;
        }
        //handle properties config in different levels
        //todo: now only handles level 2 properties should be extended later if needed
        rightConfig = selectedConfig;
        if(propertyPath && propertyPath.length){
            //only two level supported for now
            if(selectedConfig.config && selectedConfig.config[propertyPath[1]] && selectedConfig.config[propertyPath[1]].extensions){
                rightConfig = {config: this.buildConfigFromExtensions(selectedConfig.config[propertyPath[1]].extensions)};
            }
        }
        let filterByCategory=0, self=this;
        let parsed = JSON.parse(body);
        let output=[], propIndex={}, finalOutput=[];
        if(selectedConfig.useCategories){
            //allow filter by category
            if(!category){
                //get first category as default
                category = selectedConfig.categories[0];
            }
            filterByCategory=1;
        }
        if(parsed.head.vars[0]=== 'callret-0'){
          //no results!
          return [];
        }else{
          parsed.results.bindings.forEach(function(el) {
            //see if we can find a suitable title for resource
            if(el.p.value === 'http://purl.org/dc/terms/title'){
                title = el.o.value;
            }else if(el.p.value === 'http://www.w3.org/2000/01/rdf-schema#label'){
                title = el.o.value;
            }else if (el.p.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                resourceType = el.o.value;
            }
            //-------------------
            //handle categories
            if(filterByCategory){
                if(!rightConfig.config[el.p.value] || !rightConfig.config[el.p.value].category || category !== rightConfig.config[el.p.value].category[0]){
                    //skip property
                    return;
                }
            }
            let property=self.getPropertyLabel(el.p.value);
            //group by properties
            //I put the valueType into instances because we might have cases (e.g. subject property) in which for different instances, we have different value types
            if(propIndex[el.p.value]){
              propIndex[el.p.value].push({value: el.o.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), extended:parseInt(el.hasExtendedValue.value)});
            }else{
              propIndex[el.p.value]=[{value: el.o.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), extended:parseInt(el.hasExtendedValue.value)}];
            }
            output.push({propertyURI:el.p.value, property: property,  instances:[]});
          });
          output.forEach(function(el) {
            if(propIndex[el.propertyURI]){
              finalOutput.push({propertyURI: el.propertyURI, property: el.property, instances: propIndex[el.propertyURI]});
              propIndex[el.propertyURI]=null;
            }
          });
          return {props: finalOutput, title: title, resourceType: resourceType};
        }
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
            if(el.spec.propertyURI === propertyURI){
                index = i;
            }
        });
        return index;
    }
    getExtensionConfig(extensions, propertyURI){
        let index = this.findExtensionIndex(extensions, propertyURI);
        if(index === -1){
            return {};
        }
        return extensions[index].config;
    }
    parseObjectProperties(graphName, propertyURI, body) {
        let title, objectType = '';
        let selectedConfig = propertiesConfig[graphName];
        //if no specific config is found, get the generic config
        if(!selectedConfig){
            selectedConfig = propertiesConfig.generic;
        }
        let self=this;
        let parsed = JSON.parse(body);
        let output=[], propIndex={}, finalOutput=[];
        if(parsed.results.bindings.length){
          parsed.results.bindings.forEach(function(el) {
            if(el.p.value === 'http://purl.org/dc/terms/title'){
                title = el.o.value;
            }else if(el.p.value === 'http://www.w3.org/2000/01/rdf-schema#label'){
                title = el.o.value;
            }else if (el.p.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                objectType = el.o.value;
            }
            let property=self.getPropertyLabel(el.p.value);
            if(propIndex[el.p.value]){
                propIndex[el.p.value].push({value: el.o.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), extended:parseInt(el.hasExtendedValue.value)});
            }else{
                propIndex[el.p.value]=[{value: el.o.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), extended:parseInt(el.hasExtendedValue.value)}];
            }
            output.push({propertyURI:el.p.value, property: property,  instances:[]});
        });
        output.forEach(function(el) {
          if(propIndex[el.propertyURI]){
            finalOutput.push({spec:{propertyURI: el.propertyURI, property: el.property, instances: propIndex[el.propertyURI]}, config: selectedConfig.config[propertyURI] ? (selectedConfig.config[propertyURI].extensions ? self.getExtensionConfig(selectedConfig.config[propertyURI].extensions, el.propertyURI) : {}) : {}});
            propIndex[el.propertyURI]=null;
          }
        });
        return {props: finalOutput, title: title, objectType: objectType};
        }
    }
    //------ permission check functions---------------
    deleteAdminProperties(list) {
        let out = []
        const adminProps = ['https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isSuperUser', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isActive', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfGraph', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfResource', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfProperty'];
        list.forEach(function(el) {
            if (adminProps.indexOf(el.propertyURI) === -1){
                out.push(el);
            }
        });
        return out;
    }
    includesProperty(list, resource, property) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource && el.p === property){
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource, property) {
        if(parseInt(user.isSuperUser)){
            return {access: true, type: 'full'};
        }else{
            if(graph && user.editorOfGraph.indexOf(graph) !==-1){
                return {access: true, type: 'full'};
            }else{
                if(resource && user.editorOfResource.indexOf(resource) !==-1){
                    return {access: true, type: 'full'};
                }else{
                    if(property && this.includesProperty(user.editorOfProperty, resource, property)){
                        return {access: true, type: 'partial'};
                    }else{
                        return {access: false};
                    }
                }
            }
        }
    }
    //--------------------------------------------------------
}
export default ResourceUtil;
