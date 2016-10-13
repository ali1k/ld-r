'use strict';
class FacetUtil{
    constructor() {

    }
    getPropertyLabel(uri) {
        let property = '';
        let tmp = uri;
        let tmp2 = tmp.split('#');
        if(tmp2.length > 1){
            property = tmp2[1];
        }else{
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
        }
        return property;
    }
    parseCountResourcesByType(body) {
      let total = 0;
      let parsed = JSON.parse(body);
      if(parsed.results.bindings.length){
          total = parsed.results.bindings[0].total.value;
      }
      return total;
    }
    parseMasterPropertyValues(body) {
        let self = this;
        let output=[];
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            output.push( {dataType: el.v.datatype ? el.v.datatype : '', valueType: el.v.type, value: el.v.value, total: el.total.value});
        });
        return output;
    }
    parseSecondLevelPropertyValues(graphName, body) {
        let self = this;
        let output=[];
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            output.push( {v: el.s.value, label: self.getPropertyLabel(el.s.value), title: (el.title && el.title.value ? el.title.value : ''), g: graphName});
        });
        return output;
    }
}
export default FacetUtil;
