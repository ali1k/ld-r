import {BaseStore} from 'fluxible/addons';

class UserStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.users = [];
        this.graphName = '';
        this.datasetURI = '';
        this.msgSent = 0;
    }
    updateUsersList(payload) {
        this.users = payload.users;
        this.graphName = payload.graphName;
        this.datasetURI = payload.datasetURI;
        this.emitChange();
    }
    updateMsg(payload) {
        this.msgSent = 1;
        this.emitChange();
    }
    getState() {
        return {
            users: this.users,
            graphName: this.graphName,
            datasetURI: this.datasetURI,
            msgSent: this.msgSent
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.users = state.users;
        this.graphName = state.graphName;
        this.datasetURI = state.datasetURI;
        this.msgSent = state.msgSent;
    }
}

UserStore.storeName = 'UserStore'; // PR open in dispatchr to remove this need
UserStore.handlers = {
    'LOAD_USERS_LIST_SUCCESS': 'updateUsersList',
    'SEND_EMAIL_MSG_SUCCESS': 'updateMsg'
};

export default UserStore;
