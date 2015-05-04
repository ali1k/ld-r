import {BaseStore} from 'fluxible/addons';

class IndividualObjectStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.objectProperties = {};
    }
    updateObjectProperties(payload) {
        this.objectProperties[payload.objectURI] = payload.properties;
        this.emitChange();
    }
    getObjectProperties() {
        return this.objectProperties;
    }
    getState() {
        return {
            objectProperties: this.objectProperties
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.objectProperties = state.objectProperties;
    }
}

IndividualObjectStore.storeName = 'IndividualObjectStore'; // PR open in dispatchr to remove this need
IndividualObjectStore.handlers = {
    'LOAD_OBJECT_PROPERTIES_SUCCESS': 'updateObjectProperties'

};

export default IndividualObjectStore;
