import {BaseStore} from 'fluxible/addons';

class ResourceStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.properties = [];
        this.graphName = '';
    }
    updatePropertyList(payload) {
        this.graphName = payload.graphName;
        this.properties = payload.properties;
        this.emitChange();
    }
    getProperties() {
        return this.properties;
    }
    getGraphName() {
        return this.graphName;
    }
    getState() {
        return {
            graphName: this.graphName,
            properties: this.properties
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.properties = state.properties;
        this.graphName = state.graphName;
    }
}

ResourceStore.storeName = 'ResourceStore'; // PR open in dispatchr to remove this need
ResourceStore.handlers = {
    'LOAD_RESOURCE_SUCCESS': 'updatePropertyList'
};

export default ResourceStore;
