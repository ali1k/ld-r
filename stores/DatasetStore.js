import {BaseStore} from 'fluxible/addons';

class DatasetStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.resources = [];
        this.graphName = '';
        this.resourceFocusType = '';
        this.page = 0;
        this.total = 0;
    }
    updateResourceList(payload) {
        this.graphName = payload.graphName;
        this.resources = payload.resources;
        this.resourceFocusType = payload.resourceFocusType;
        this.page = payload.page;
        this.emitChange();
    }
    updateDatasetTotal(payload) {
        this.total = payload.total;
        this.emitChange();
    }
    getState() {
        return {
            graphName: this.graphName,
            resources: this.resources,
            resourceFocusType: this.resourceFocusType,
            page: this.page,
            total: this.total
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.resources = state.resources;
        this.graphName = state.graphName;
        this.resourceFocusType = state.resourceFocusType;
        this.page = state.page;
        this.total = state.total;
    }
}

DatasetStore.storeName = 'DatasetStore'; // PR open in dispatchr to remove this need
DatasetStore.handlers = {
    'LOAD_DATASET_SUCCESS': 'updateResourceList',
    'UPDATE_DATASET_TOTAL_SUCCESS': 'updateDatasetTotal'
};

export default DatasetStore;
