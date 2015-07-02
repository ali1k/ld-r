import {BaseStore} from 'fluxible/addons';

class IndividualObjectStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.objectProperties = {};
        this.objectTypes = {};
    }
    updateObjectProperties(payload) {
        this.objectProperties[payload.objectURI] = payload.properties;
        this.objectTypes[payload.objectURI] = payload.objectType;
        this.emitChange();
    }
    getState() {
        return {
            objectProperties: this.objectProperties,
            objectTypes: this.objectTypes
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.objectProperties = state.objectProperties;
        this.objectTypes = state.objectTypes;
    }
}

IndividualObjectStore.storeName = 'IndividualObjectStore'; // PR open in dispatchr to remove this need
IndividualObjectStore.handlers = {
    'LOAD_OBJECT_PROPERTIES_SUCCESS': 'updateObjectProperties'

};

export default IndividualObjectStore;
