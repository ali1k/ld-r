'use strict';
import {checkEditAccess} from './accessManagement';

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
        if(!parsed.results.bindings || !parsed.results.bindings.length){
            return output;
        }
        parsed.results.bindings.forEach(function(el) {
            if(el.v){
                output.push( {dataType: el.v.datatype ? el.v.datatype : '', valueType: el.v.type, value: el.v.value, total: el.total.value});
            }
        });
        return output;
    }
    parseSecondLevelPropertyValues(user, datasetURI, body, rconfig) {
        let self = this;
        let output=[];
        let resources = [];
        let accessLevel = {access: false};
        let parsed = JSON.parse(body);
        if(!parsed.results.bindings || !parsed.results.bindings.length){
            return output;
        }
        //----handle analysisProps
        let aprops = [];
        let propsForAnalysis = {};
        parsed.results.bindings.forEach(function(el) {
            for(let prop in el){
                if(prop.indexOf('ldr_ap') !== -1 && aprops.indexOf(prop) === -1){
                    aprops.push(prop);
                }
            }
        });
        //----------------
        parsed.results.bindings.forEach(function(el) {
            if(user){
                /*
                if(user.id == el.instances[0].value) {
                    userIsCreator = 1;
                }*/
                accessLevel=checkEditAccess(user, datasetURI, el.s.value, rconfig.resourceFocusType , 0);
            }
            propsForAnalysis = {};
            aprops.forEach(function(ap) {
                if(el[ap] && el[ap].value){
                    propsForAnalysis[ap.replace('ldr_ap', '')] = el[ap].value;
                }else{
                    //missing values
                    propsForAnalysis[ap.replace('ldr_ap', '')] = '--m--';
                }
            });
            output.push({v: el.s.value, label: self.getPropertyLabel(el.s.value), title: (el.title && el.title.value ? el.title.value : ''), image: el.image ? el.image.value : '', geo: el.geo ? el.geo.value : '', d: datasetURI, accessLevel: accessLevel, propsForAnalysis: propsForAnalysis});
        });
        return output;
    }
}
export default FacetUtil;
