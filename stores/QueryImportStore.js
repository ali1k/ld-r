import {BaseStore} from 'fluxible/addons';

class QueryImportStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.queries = {};
    }
    updateQueriesSaved(payload) {
        this.queries = payload.states;
        this.emitChange();
    }
    getState() {
        return {
            queries: this.queries
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.queries = state.queries;
    }
}

QueryImportStore.storeName = 'QueryImportStore'; // PR open in dispatchr to remove this need
QueryImportStore.handlers = {
    'UPDATE_QUERIES_SAVED': 'updateQueriesSaved'
};

export default QueryImportStore;
