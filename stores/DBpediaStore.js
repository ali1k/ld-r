import {BaseStore} from 'fluxible/addons';

class DBpediaStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.suggestions = [];
    }
    lookupDBpedia(payload) {
        this.suggestions = payload.suggestions;
        this.emitChange();
    }
    getState() {
        return {
            suggestions: this.suggestions
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.suggestions = state.suggestions;
    }
}

DBpediaStore.storeName = 'DBpediaStore'; // PR open in dispatchr to remove this need
DBpediaStore.handlers = {
    'LOOKUP_DBPEDIA_SUCCESS': 'lookupDBpedia'
};

export default DBpediaStore;
