import {BaseStore} from 'fluxible/addons';

class DatasetStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.resources = [];
        this.graphName = '';
        this.resourceFocusType = '';
    }
    updateResourceList(payload) {
        this.graphName = payload.graphName;
        this.resources = payload.resources;
        this.resourceFocusType = payload.resourceFocusType;
        this.emitChange();
    }
    getState() {
        return {
            graphName: this.graphName,
            resources: this.resources,
            resourceFocusType: this.resourceFocusType
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.resources = state.resources;
        this.graphName = state.graphName;
        this.resourceFocusType = state.resourceFocusType;
    }
}

DatasetStore.storeName = 'DatasetStore'; // PR open in dispatchr to remove this need
DatasetStore.handlers = {
    'LOAD_DATASET_SUCCESS': 'updateResourceList'
};

export default DatasetStore;
