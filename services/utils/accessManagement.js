import {enableAuthentication} from '../../configs/general';

let includesDataset= (rights, dataset)=> {
    let out = false;
    rights.forEach(function(el) {
        if (el.scope === 'D') {
            if(el.dataset === dataset){
                out = true;
                return out;
            }
        }
    });
    return out;
}
let includesResource= (rights, dataset, resource, resourceType)=> {
    let out = false;
    rights.forEach(function(el) {
        if (el.scope === 'DR') {
            if(el.dataset === dataset && el.resource === resource){
                out = true;
                return out;
            }else{
                if(el.treatAsResourceType && el.dataset === dataset &&  resourceType.indexOf(el.resource)!==-1){
                    out = true;
                    return out;
                }
            }
        }else if (el.scope === 'R') {
            if(el.resource === resource){
                out = true;
                return out;
            }else{
                if(el.treatAsResourceType &&  resourceType.indexOf(el.resource)!==-1){
                    out = true;
                    return out;
                }
            }
        }
    });
    return out;
}
let includesProperty= (rights, dataset, resource, resourceType, property)=> {
    let out = false;
    rights.forEach(function(el) {
        if (el.scope  && el.scope === 'DP') {
            if(el.dataset === dataset && el.property === property){
                out = true;
                return out;
            }
        }else if (el.scope  && el.scope === 'RP') {
            if(el.resource === resource && el.property === property){
                out = true;
                return out;
            }else{
                if(el.treatAsResourceType && el.resource === resourceType && el.property === property){
                    out = true;
                    return out;
                }
            }
        }else if (el.scope  && el.scope === 'DRP') {
            if(el.dataset === dataset && el.resource === resource && el.property === property){
                out = true;
                return out;
            }else{
                if(el.treatAsResourceType && el.dataset === dataset && el.resource === resourceType && el.property === property){
                    out = true;
                    return out;
                }
            }
        }else if (el.scope  && el.scope === 'P') {
            if(el.property === property){
                out = true;
                return out;
            }
        }
    });
    return out;
}

export default {
    checkViewAccess(user, dataset, resource, resourceType, property) {
        //check view access
        if(!enableAuthentication){
            return {
                access: true,
                type: 'full'
            };
        }
        if (parseInt(user.isSuperUser)) {
            return {
                access: true,
                type: 'full'
            };
        } else {
            if (dataset && user.viewerOf && includesDataset(user.viewerOf, dataset)) {
                return {
                    access: true,
                    type: 'full'
                };
            } else {
                if (resource && user.viewerOf && includesResource(user.viewerOf, dataset, resource, resourceType)) {
                    return {
                        access: true,
                        type: 'full'
                    };
                } else {
                    if (property && user.viewerOf && includesProperty(user.viewerOf, dataset, resource, resourceType, property)) {
                        return {
                            access: true,
                            type: 'partial'
                        };
                    } else {
                        return {
                            access: false
                        };
                    }
                }
            }
        }
    },
    checkEditAccess(user, dataset, resource, resourceType, property) {
        //console.log(user.editorOf, dataset, resource, resourceType, property);
        if(!enableAuthentication){
            return {
                access: true,
                type: 'full'
            };
        }
        if (parseInt(user.isSuperUser)) {
            return {
                access: true,
                type: 'full'
            };
        } else {
            if (dataset && user.editorOf && includesDataset(user.editorOf, dataset)) {
                return {
                    access: true,
                    type: 'full'
                };
            } else {
                if (resource && user.editorOf && includesResource(user.editorOf, dataset, resource, resourceType)) {
                    return {
                        access: true,
                        type: 'full'
                    };
                } else {
                    if (property && user.editorOf && includesProperty(user.editorOf, dataset, resource, resourceType, property)) {
                        return {
                            access: true,
                            type: 'partial'
                        };
                    } else {
                        return {
                            access: false
                        };
                    }
                }
            }
        }
    }
}
