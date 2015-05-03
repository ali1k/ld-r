'use strict';
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
        let output=[];
        let parsed = JSON.parse(body);
        if(parsed.results.bindings.length){
          parsed.results.bindings.forEach(function(el) {

          });
        }
        return output;
    }
}
export default ResourceUtil;
