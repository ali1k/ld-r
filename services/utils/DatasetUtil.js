'use strict';
class DatasetUtil{
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
    parseResourcesByType(body, graphName) {
      let output=[];
      let parsed = JSON.parse(body);
      if(parsed.results.bindings.length){
          if(String(graphName)===''){
              parsed.results.bindings.forEach(function(el) {
                output.push( {v: el.resource.value, g: el.graphName.value, title: el.title? el.title.value : '', label: el.label? el.label.value: ''});
              });
          }else{
              parsed.results.bindings.forEach(function(el) {
                output.push( {v: el.resource.value, g: graphName, title: el.title? el.title.value : '', label: el.label? el.label.value: ''});
              });
          }
      }
      return output;
    }
    parseCountResourcesByType(body) {
      let total = 0;
      let parsed = JSON.parse(body);
      if(parsed.results.bindings.length){
          total = parsed.results.bindings[0].total.value;
      }
      return total;
    }
    parseMasterPropertyValues(body, status, level, propertyURI, value) {
        let self = this;
        let output={};
        let values=[];
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            values.push( {value: el.v.value, label: self.getPropertyLabel(el.v.value), total: el.total.value});
        });
        output ={status: status, level: level, propertyURI: propertyURI, value: value, items: values}
        return output;
    }
    parseSecondLevelPropertyValues(graphName, body, status, level, propertyURI, value) {
        let self = this;
        let output={};
        let values=[];
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            values.push( {v: el.s.value, label: self.getPropertyLabel(el.s.value), g: graphName});
        });
        output ={status: status, level: level, propertyURI: propertyURI, value: value, items: values}
        return output;
    }
}
export default DatasetUtil;
