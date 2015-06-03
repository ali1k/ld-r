import {BaseStore} from 'fluxible/addons';

class FacetedBrowserStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.clearFacets();
    }
    clearAll() {
        this.isComplete = 1;
        this.facets = {};
        this.resources = [];
        this.total = 0;
        this.page = 1;
        this.graphName = '';
    }
    clearFacets() {
        this.clearAll();
        this.emitChange();
    }
    startTask () {
        this.isComplete = 0;
        this.emitChange();
    }
    updateFacetResources(payload) {
        //for second level properties
        this.resources = payload.facets.items;
        this.total = payload.total;
        this.page = payload.page;
        this.graphName = payload.graphName;
        this.isComplete = 1;
        this.emitChange();
    }
    updateMasterFacets(payload) {
        //for master facet
        if(payload.facets.status){
            this.facets[payload.facets.propertyURI] = payload.facets.items;
        }else{
            delete this.facets[payload.facets.propertyURI];
        }
        this.page = payload.page;
        this.graphName = payload.graphName;
        this.isComplete = 1;
        this.emitChange();
    }
    handleFacetSideEffects(payload) {
        this.facets[payload.facets.propertyURI] = payload.facets.items;
        this.page = payload.page;
        this.graphName = payload.graphName;
        this.isComplete = 1;
        this.emitChange();
    }

    getState() {
        return {
            facets: this.facets,
            graphName: this.graphName,
            resources: this.resources,
            total: this.total,
            page: this.page,
            isComplete: this.isComplete
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.facets = state.facets;
        this.graphName = state.graphName;
        this.resources = state.resources;
        this.total = state.total;
        this.page = state.page;
    }
}

FacetedBrowserStore.storeName = 'FacetedBrowserStore'; // PR open in dispatchr to remove this need
FacetedBrowserStore.handlers = {
    'LOAD_FACETS_RESOURCES_SUCCESS': 'updateFacetResources',
    'LOAD_MASTER_FACETS_SUCCESS': 'updateMasterFacets',
    'LOAD_SIDE_EFFECTS_FACETS_SUCCESS': 'handleFacetSideEffects',
    'CLEAR_FACETS_SUCCESS': 'clearFacets',
    'START_TASK_FACETS': 'startTask'
};

export default FacetedBrowserStore;
