'use strict';
import {propertiesConfig} from '../../configs/reactor';
class ResourceUtil{
    constructor() {

    }
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
    parseProperties(body, category) {
        let self=this;
        let parsed = JSON.parse(body);
        let output=[], propIndex={}, finalOutput=[];
        if(parsed.head.vars[0]=== 'callret-0'){
          //no results!
          return [];
        }else{
          parsed.results.bindings.forEach(function(el) {
            var property=self.getPropertyLabel(el.p.value);
            if(category && category !== 'default'){
                //filter by category
                if(propertiesConfig[el.p.value] && propertiesConfig[el.p.value].category){
                    if(category === propertiesConfig[el.p.value].category[0]){
                        console.log(el.p.value);
                    }
                }
            }else{

            }
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
}
export default ResourceUtil;
