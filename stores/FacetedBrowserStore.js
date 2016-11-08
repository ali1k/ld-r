import {BaseStore} from 'fluxible/addons';

class FacetedBrowserStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.clearFacets();
    }
    clearAll() {
        this.facets = {};
        this.resources = [];
        this.total = 0;
        this.page = 1;
        this.graphName = '';
        this.datasetURI = '';
        this.dynamicConfig = {};
    }
    clearFacets() {
        this.clearAll();
        this.emitChange();
    }
    loadDynamicFacetConfigs(payload) {
        this.dynamicConfig = payload.dynamicConfig;
        this.emitChange();
    }
    updateFacetResources(payload) {
        //for second level properties
        this.resources = payload.facets.items;
        this.total = payload.total;
        this.page = payload.page;
        this.graphName = payload.graphName;
        this.datasetURI = payload.datasetURI;
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
        this.datasetURI = payload.datasetURI;
        this.emitChange();
    }
    handleFacetSideEffects(payload) {
        this.facets[payload.facets.propertyURI] = payload.facets.items;
        this.page = payload.page;
        this.graphName = payload.graphName;
        this.datasetURI = payload.datasetURI;
        this.emitChange();
    }

    getState() {
        return {
            facets: this.facets,
            graphName: this.graphName,
            datasetURI: this.datasetURI,
            resources: this.resources,
            total: this.total,
            page: this.page,
            dynamicConfig: this.dynamicConfig
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.facets = state.facets;
        this.graphName = state.graphName;
        this.datasetURI = state.datasetURI;
        this.resources = state.resources;
        this.total = state.total;
        this.page = state.page;
        this.dynamicConfig = state.dynamicConfig;
    }
}

FacetedBrowserStore.storeName = 'FacetedBrowserStore'; // PR open in dispatchr to remove this need
FacetedBrowserStore.handlers = {
    'LOAD_FACETS_RESOURCES_SUCCESS': 'updateFacetResources',
    'LOAD_MASTER_FACETS_SUCCESS': 'updateMasterFacets',
    'LOAD_SIDE_EFFECTS_FACETS_SUCCESS': 'handleFacetSideEffects',
    'LOAD_DYNAMIC_FACETS_CONFIG': 'loadDynamicFacetConfigs',
    'CLEAR_FACETS_SUCCESS': 'clearFacets'
};

export default FacetedBrowserStore;
