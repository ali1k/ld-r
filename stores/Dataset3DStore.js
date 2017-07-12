import {BaseStore} from 'fluxible/addons';
class Dataset3DStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.cleanAll();
    }
    cleanAll() {
        this.dataset = {classes: []};
    }
    cleanDataset() {
        this.cleanAll();
        this.emitChange();
    }
    updateResourceList(payload) {
        this.dataset = {
            graphName: payload.graphName,
            datasetURI: payload.datasetURI,
            resources: payload.resources,
            page: payload.page,
            config: payload.config,
            total: this.dataset.total,
            resourceQuery: payload.resourceQuery,
            error: payload.error
        };
        this.emitChange();
    }
    updateDatasetTotal(payload) {
        this.dataset.total = payload.total;
        this.emitChange();
    }
    getState() {
        return {
            dataset: this.dataset
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.dataset = state.dataset;
    }
}

Dataset3DStore.storeName = 'Dataset3DStore'; // PR open in dispatchr to remove this need
Dataset3DStore.handlers = {
    'LOAD_DATASET_SUCCESS': 'updateResourceList',
    'UPDATE_DATASET_TOTAL_SUCCESS': 'updateDatasetTotal',
    'CLEAN_DATASET_SUCCESS': 'cleanDataset'
};

export default Dataset3DStore;
