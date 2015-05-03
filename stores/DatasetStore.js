import {BaseStore} from 'fluxible/addons';

class DatasetStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.resources = [];
        this.graphName = '';
    }
    updateResourceList(payload) {
        this.graphName = payload.graphName;
        this.resources = payload.resources;
        this.emitChange();
    }
    getResources() {
        return this.resources;
    }
    getGraphName() {
        return this.graphName;
    }
    getState() {
        return {
            graphName: this.graphName,
            resources: this.resources
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.resources = state.resources;
        this.graphName = state.graphName;
    }
}

DatasetStore.storeName = 'DatasetStore'; // PR open in dispatchr to remove this need
DatasetStore.handlers = {
    'LOAD_DATASET_SUCCESS': 'updateResourceList'
};

export default DatasetStore;
