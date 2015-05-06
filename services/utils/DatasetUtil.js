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
                output.push( {v: el.resource.value, g: el.graphName.value});
              });
          }else{
              parsed.results.bindings.forEach(function(el) {
                output.push( {v: el.resource.value, g: graphName});
              });
          }
      }
      return output;
    }
}
export default DatasetUtil;
