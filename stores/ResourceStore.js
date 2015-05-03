import {BaseStore} from 'fluxible/addons';

class ResourceStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.properties = [];
        this.graphName = '';
        this.resourceURI = '';
    }
    updatePropertyList(payload) {
        this.graphName = payload.graphName;
        this.resourceURI = payload.resourceURI;
        this.properties = payload.properties;
        this.emitChange();
    }
    getProperties() {
        return this.properties;
    }
    getGraphName() {
        return this.graphName;
    }
    getResourceURI() {
        return this.resourceURI;
    }
    getState() {
        return {
            graphName: this.graphName,
            resourceURI: this.resourceURI,
            properties: this.properties
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.properties = state.properties;
        this.resourceURI = state.resourceURI;
        this.graphName = state.graphName;
    }
}

ResourceStore.storeName = 'ResourceStore'; // PR open in dispatchr to remove this need
ResourceStore.handlers = {
    'LOAD_RESOURCE_SUCCESS': 'updatePropertyList'
};

export default ResourceStore;
