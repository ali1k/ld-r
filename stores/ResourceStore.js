import {BaseStore} from 'fluxible/addons';
import ResourceStoreUtil from './utils/ResourceStoreUtil';
let utilObject = new ResourceStoreUtil();

class ResourceStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.cleanAll();
    }
    updatePropertyList(payload) {
        this.graphName = payload.graphName;
        this.resourceURI = payload.resourceURI;
        this.resourceType = payload.resourceType;
        this.currentCategory = payload.currentCategory;
        this.propertyPath = payload.propertyPath;
        // this.properties = payload.properties;
        this.properties = utilObject.preservePropertiesOrder(this.properties, payload.properties);
        this.title = payload.title ? payload.title : payload.resourceURI;
        this.config = payload.config;
        this.isComplete = 1;
        this.emitChange();
    }
    cleanAll() {
        this.properties = [];
        this.graphName = '';
        this.currentCategory = 0;
        this.resourceURI = '';
        this.resourceType = '';
        this.title = '';
        this.propertyPath = [];
        this.config = {};
        this.isComplete = 1;
    }
    cleanResource() {
        this.cleanAll();
        this.emitChange();
    }
    startTask () {
        this.isComplete = 0;
        this.emitChange();
    }
    getState() {
        return {
            graphName: this.graphName,
            resourceURI: this.resourceURI,
            resourceType: this.resourceType,
            title: this.title,
            currentCategory: this.currentCategory,
            properties: this.properties,
            propertyPath: this.propertyPath,
            config: this.config,
            isComplete: this.isComplete
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.properties = state.properties;
        this.resourceURI = state.resourceURI;
        this.resourceType = state.resourceType;
        this.title = state.title;
        this.graphName = state.graphName;
        this.currentCategory = state.currentCategory;
        this.propertyPath = state.propertyPath;
        this.config = state.config;
    }
}

ResourceStore.storeName = 'ResourceStore'; // PR open in dispatchr to remove this need
ResourceStore.handlers = {
    'LOAD_RESOURCE_SUCCESS': 'updatePropertyList',
    'CLEAN_RESOURCE_SUCCESS': 'cleanResource',
    'START_TASK_RESOURCE': 'startTask'
};

export default ResourceStore;
