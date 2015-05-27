'use strict';
class DatasetUtil{
    constructor() {

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
}
export default DatasetUtil;
