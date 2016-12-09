'use strict';
import {checkAccess} from './helpers';

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
    parseSecondLevelPropertyValues(user, datasetURI, body) {
        let self = this;
        let output=[];
        let resources = [];
        let accessLevel = {access: false};
        let parsed = JSON.parse(body);
        parsed.results.bindings.forEach(function(el) {
            if(resources.indexOf(el.s.value) === -1){
                resources.push(el.s.value);
                if(user){
                    /*
                    if(user.id == el.instances[0].value) {
                        userIsCreator = 1;
                    }*/
                    accessLevel=checkAccess(user, datasetURI, el.s.value, 0);
                }
                output.push( {v: el.s.value, label: self.getPropertyLabel(el.s.value), title: (el.title && el.title.value ? el.title.value : ''), image: el.image ? el.image.value : '', geo: el.geo ? el.geo.value : '', d: datasetURI, accessLevel: accessLevel});
            }
        });
        return output;
    }
}
export default FacetUtil;
