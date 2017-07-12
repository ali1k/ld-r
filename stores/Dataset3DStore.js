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
    updateClasses(payload) {
        this.dataset = {
            classes: payload.classes
        };
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
    'LOAD_CLASS_FREQUENCY': 'updateClasses',
    'CLEAN_CLASS_FREQUENCY_SUCCESS': 'cleanDataset'
};

export default Dataset3DStore;
