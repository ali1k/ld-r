import {BaseStore} from 'fluxible/addons';

class DatasetAnnotationStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.stats = {annotated: 0, total: 0};
        this.currentText = '';
    }
    updateStatsAnnotated(payload) {
        this.stats.annotated = payload.annotated;
        this.emitChange();
    }
    updateStatsTotal(payload) {
        this.stats.total = payload.total;
        this.emitChange();
    }
    updateText(payload) {
        this.currentText = payload.currentText;
        //this.emitChange();
    }
    getState() {
        return {
            stats: this.stats,
            currentText: this.currentText
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.stats = state.stats;
        this.currentText = state.currentText;
    }
}

DatasetAnnotationStore.storeName = 'DatasetAnnotationStore'; // PR open in dispatchr to remove this need
DatasetAnnotationStore.handlers = {
    'UPDATE_ANNOTATION_STAT_ANNOTATED': 'updateStatsAnnotated',
    'UPDATE_ANNOTATION_STAT_TOTAL': 'updateStatsTotal',
    'UPDATE_ANNOTATION_TEXT': 'updateText'
};

export default DatasetAnnotationStore;
