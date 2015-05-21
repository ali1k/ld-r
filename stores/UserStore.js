import {BaseStore} from 'fluxible/addons';

class UserStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.users = [];
        this.graphName = '';
    }
    updateUsersList(payload) {
        this.users = payload.users;
        this.graphName = payload.graphName;
        this.emitChange();
    }
    getState() {
        return {
            users: this.users,
            graphName: this.graphName
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.users = state.users;
        this.graphName = state.graphName;
    }
}

UserStore.storeName = 'UserStore'; // PR open in dispatchr to remove this need
UserStore.handlers = {
    'LOAD_USERS_LIST_SUCCESS': 'updateUsersList'
};

export default UserStore;
