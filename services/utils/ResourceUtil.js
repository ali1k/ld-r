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
    parseProperties(body, graphName, category) {
        let selectedConfig;
        //first check if there is a specific config for the property on the selected graphName
        selectedConfig = propertiesConfig[graphName];
        //if no specific config is found, get the generic config
        if(!selectedConfig){
            selectedConfig = propertiesConfig.generic;
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
            if(filterByCategory){
                if(!selectedConfig.config[el.p.value] || !selectedConfig.config[el.p.value].category || category !== selectedConfig.config[el.p.value].category[0]){
                    //skip property
                    return;
                }
            }
            var property=self.getPropertyLabel(el.p.value);
            //group by properties
            //I put the valueType into instances because we might have cases (e.g. subject property) in which for different instances, we have different value types
            if(propIndex[el.p.value]){
              propIndex[el.p.value].push({value: el.o.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), extended:parseInt(el.hasExtendedValue.value)});
            }else{
              propIndex[el.p.value]=[{value: el.o.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), extended:parseInt(el.hasExtendedValue.value)}];
            }
            output.push({propertyURI:el.p.value, property: property,  hint: (el.hint? el.hint.value:''), prefLabel: (el.prefLabel? el.prefLabel.value:''), defaultOptions: (el.defaultOptions? el.defaultOptions.value: '') ,  instances:[{value: el.o.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), extended:parseInt(el.hasExtendedValue.value)}]});
          });
          output.forEach(function(el) {
            if(propIndex[el.propertyURI]){
              finalOutput.push({propertyURI:el.propertyURI, property: el.property, hint: el.hint, prefLabel: el.prefLabel, defaultOptions: el.defaultOptions, instances: propIndex[el.propertyURI]});
              propIndex[el.propertyURI]=null;
            }
          });
          return finalOutput;
        }
    }
    parseObjectProperties(body) {
        let self=this;
        let parsed = JSON.parse(body);
        var output=[];
        if(parsed.results.bindings.length){
          parsed.results.bindings.forEach(function(el) {
            output.push({spec:{property: self.getPropertyLabel(el.p.value), propertyURI: el.p.value, valueType: el.o.type, dataType:(el.o.type==='typed-literal'?el.o.datatype:''), value: el.o.value}, config: propertiesConfig[el.p.value]});
        });
          return output;
        }
    }
    //------ permission check functions---------------
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
