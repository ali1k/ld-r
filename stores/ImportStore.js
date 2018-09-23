import {BaseStore} from 'fluxible/addons';

class ImportStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.rows = [];
        this.total = 0;
        this.completed = 0;
        this.output = '';
    }
    clearAll() {
        this.rows = [];
        this.total = 0;
        this.completed = 0;
        this.output = '';
    }
    clearConf(){
        this.clearAll();
        this.emitChange();
    }
    updateOutput(payload){
        this.output = payload.output;
        this.emitChange();
    }
    updateAttribs(payload) {
        this.rows = payload.rows;
        this.total = payload.total;
        this.output = payload.output;
        this.completed = 1;
        this.emitChange();
    }
    getState() {
        return {
            rows: this.rows,
            total: this.total,
            completed: this.completed,
            output: this.output
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.rows = state.rows;
        this.total = state.total;
        this.completed = state.completed;
    }
}

ImportStore.storeName = 'ImportStore'; // PR open in dispatchr to remove this need
ImportStore.handlers = {
    'READ_CSV_SUCCESS': 'updateAttribs',
    'CLEAR_IMPORT_CONFFIG_SUCCESS': 'clearConf',
    'CREATE_JSONLD_SUCCESS': 'updateOutput'
};

export default ImportStore;
