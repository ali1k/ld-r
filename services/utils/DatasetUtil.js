'use strict';
import {checkEditAccess} from './helpers';

class DatasetUtil {
    constructor() {

    }
    getPropertyLabel(uri) {
        let property = '';
        let tmp = uri;
        let tmp2 = tmp.split('#');
        if (tmp2.length > 1) {
            property = tmp2[1];
        } else {
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
        }
        return property;
    }
    parseResourcesByType(user, body, datasetURI, rconfig) {
        let output = [];
        let resources = [];
        let accessLevel = {access: false};
        let parsed = JSON.parse(body);
        if (parsed.results.bindings.length) {
            parsed.results.bindings.forEach(function(el) {
                if(resources.indexOf(el.resource.value) === -1){
                    resources.push(el.resource.value);
                    if(user){
                        /*
                        if(user.id == el.instances[0].value) {
                            userIsCreator = 1;
                        }*/
                        accessLevel=checkEditAccess(user, datasetURI, el.resource.value, rconfig.resourceFocusType , 0);
                    }
                    output.push({
                        v: el.resource.value,
                        d: datasetURI,
                        title: el.title ? el.title.value : '',
                        image: el.image ? el.image.value : '',
                        geo: el.geo ? el.geo.value : '',
                        label: el.label ? el.label.value : '',
                        accessLevel: accessLevel
                    });
                }
            });
        }
        return output;
    }
    parseResourcePropForAnnotation(body) {
        let output = [];
        let parsed = JSON.parse(body);
        if (parsed.results.bindings.length) {
            parsed.results.bindings.forEach(function(el) {
                output.push({
                    r: el.resource.value,
                    ov: el.objectValue ? el.objectValue.value : '',
                });
            });
        }
        return output;
    }
    parseCountResourcesByType(body) {
        let total = 0;
        let parsed = JSON.parse(body);
        if (parsed.results.bindings.length) {
            total = parsed.results.bindings[0].total.value;
        }
        return total;
    }
    parseCountTotalResourcesWithProp(body) {
        let total = 0;
        let parsed = JSON.parse(body);
        if (parsed.results.bindings.length) {
            total = parsed.results.bindings[0].total.value;
        }
        return total;
    }
    parseCountAnnotatedResourcesWithProp(body) {
        let annotated = 0;
        let parsed = JSON.parse(body);
        if (parsed.results.bindings.length) {
            annotated = parsed.results.bindings[0].atotal.value;
        }
        return annotated;
    }
}
export default DatasetUtil;
