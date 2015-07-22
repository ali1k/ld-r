import {BaseStore} from 'fluxible/addons';
class DatasetStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.dataset = {total: 0, resource: []};
    }
    updateResourceList(payload) {
        this.dataset = {
            graphName: payload.graphName,
            resources: payload.resources,
            page: payload.page,
            config: payload.config,
            total: this.dataset.total
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

DatasetStore.storeName = 'DatasetStore'; // PR open in dispatchr to remove this need
DatasetStore.handlers = {
    'LOAD_DATASET_SUCCESS': 'updateResourceList',
    'UPDATE_DATASET_TOTAL_SUCCESS': 'updateDatasetTotal'
};

export default DatasetStore;
