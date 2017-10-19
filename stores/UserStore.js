import {BaseStore} from 'fluxible/addons';

class UserStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.users = [];
        this.graphName = '';
        this.datasetURI = '';
    }
    updateUsersList(payload) {
        this.users = payload.users;
        this.graphName = payload.graphName;
        this.datasetURI = payload.datasetURI;
        this.emitChange();
    }
    getState() {
        return {
            users: this.users,
            graphName: this.graphName,
            datasetURI: this.datasetURI
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.users = state.users;
        this.graphName = state.graphName;
        this.datasetURI = state.datasetURI;
    }
}

UserStore.storeName = 'UserStore'; // PR open in dispatchr to remove this need
UserStore.handlers = {
    'LOAD_USERS_LIST_SUCCESS': 'updateUsersList'
};

export default UserStore;
