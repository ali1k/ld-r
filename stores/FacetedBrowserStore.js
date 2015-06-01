import {BaseStore} from 'fluxible/addons';

class FacetedBrowserStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.clearFacets();
    }
    clearFacets() {
        this.isComplete = 0;
        this.facets = {};
        this.resources = [];
        this.total = 0;
        this.page = 1;
        this.graphName = '';
    }
    startTask () {
        this.isComplete = 0;
        this.emitChange();
    }
    updateFacets(payload) {
        if(payload.facets.level === 1){
            //for master facet
            if(payload.facets.status){
                this.facets[payload.facets.propertyURI] = payload.facets.items;
            }else{
                delete this.facets[payload.facets.propertyURI];
            }
        }else{
            //for second level properties
            this.resources = payload.facets.items;
            this.total = payload.total;
        }
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
    'LOAD_FACETS_SUCCESS': 'updateFacets',
    'CLEAR_FACETS_SUCCESS': 'clearFacets',
    'START_TASK_FACETS': 'startTask'
};

export default FacetedBrowserStore;
