import {BaseStore} from 'fluxible/addons';

class DatasetAnnotationStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.stats = {annotated: 0, total: 0};
    }
    updateStats(payload) {
        this.stats = {annotated: payload.annotated, total: payload.total};
        this.emitChange();
    }
    getState() {
        return {
            stats: this.stats
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.stats = state.stats;
    }
}

DatasetAnnotationStore.storeName = 'DatasetAnnotationStore'; // PR open in dispatchr to remove this need
DatasetAnnotationStore.handlers = {
    'UPDATE_ANNOTATION_STAT': 'updateStats'
};

export default DatasetAnnotationStore;
