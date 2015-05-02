'use strict';

export default {
  parseResourcesByType: (body)=> {
    let output=[];
    let parsed = JSON.parse(body);
    if(parsed.results.bindings.length){
      parsed.results.bindings.forEach(function(el) {
        output.push(el.resource.value);
      });
    }
    return output;
  }
}
