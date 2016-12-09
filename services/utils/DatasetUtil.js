'use strict';
import {checkAccess} from './helpers';

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
    parseResourcesByType(user, body, datasetURI) {
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
                        accessLevel=checkAccess(user, datasetURI, el.resource.value, 0);
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
    parseCountResourcesByType(body) {
        let total = 0;
        let parsed = JSON.parse(body);
        if (parsed.results.bindings.length) {
            total = parsed.results.bindings[0].total.value;
        }
        return total;
    }
}
export default DatasetUtil;
