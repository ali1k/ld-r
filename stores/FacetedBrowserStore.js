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
        this.resourceQuery = '';
        this.page = 1;
        this.graphName = '';
        this.datasetURI = '';
        this.datasetConfig= {};
        this.config = {};
    }
    clearFacets() {
        this.clearAll();
        this.emitChange();
    }
    loadFacetConfigs(payload) {
        this.prepareFacetConfigs(payload.datasetURI, payload.dynamicConfig, payload.staticConfig, payload.dynamicDatasetConfig, payload.staticDatasetConfig);
        this.emitChange();
    }
    prepareFacetConfigs(datasetURI, dynamicConfig, staticConfig, dynamicDatasetConfig, staticDatasetConfig) {

        this.datasetConfig = staticDatasetConfig.dataset.generic;
        if(staticDatasetConfig.dataset[datasetURI]){
            for(let p in staticDatasetConfig.dataset[datasetURI]){
                this.datasetConfig[p] = staticDatasetConfig.dataset[datasetURI][p];
            }
        }
        if(dynamicDatasetConfig.dataset[datasetURI]){
            for(let p in dynamicDatasetConfig.dataset[datasetURI]){
                this.datasetConfig[p] = dynamicDatasetConfig.dataset[datasetURI][p];
            }
        }

        this.config = staticConfig.facets.generic;
        if(staticConfig.facets[datasetURI]){
            for(let p in staticConfig.facets[datasetURI]){
                this.config[p] = staticConfig.facets[datasetURI][p];
            }
        }
        //overwrite by dynamic
        if(dynamicConfig.facets[datasetURI]){
            for(let p in dynamicConfig.facets[datasetURI]){
                if(!this.config[p]){
                    this.config[p] = dynamicConfig.facets[datasetURI][p];
                }else{
                    if(p === 'list'){
                        dynamicConfig.facets[datasetURI][p].forEach((el)=> {
                            if(this.config[p].indexOf(el) === -1){
                                this.config[p].push(el);
                            }
                        })
                    }else if(p === 'config'){
                        //console.log(dynamicConfig.facets[datasetURI][p]);
                        for(let fc in dynamicConfig.facets[datasetURI][p]){
                            this.config[p][fc] = dynamicConfig.facets[datasetURI][p][fc];
                        }
                    }

                }

            }
        }
    }
    updateFacetResources(payload) {
        //for second level properties
        this.resources = payload.facets.items;
        this.total = payload.total;
        this.page = payload.page;
        this.graphName = payload.graphName;
        this.datasetURI = payload.datasetURI;
        this.resourceQuery = payload.resourceQuery;
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
            datasetConfig: this.datasetConfig,
            config: this.config,
            resources: this.resources,
            total: this.total,
            resourceQuery: this.resourceQuery,
            page: this.page
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.facets = state.facets;
        this.graphName = state.graphName;
        this.datasetURI = state.datasetURI;
        this.datasetConfig = state.datasetConfig;
        this.config = state.config;
        this.resources = state.resources;
        this.total = state.total;
        this.page = state.page;
        this.resourceQuery = state.resourceQuery;
    }
}

FacetedBrowserStore.storeName = 'FacetedBrowserStore'; // PR open in dispatchr to remove this need
FacetedBrowserStore.handlers = {
    'LOAD_FACETS_RESOURCES_SUCCESS': 'updateFacetResources',
    'LOAD_MASTER_FACETS_SUCCESS': 'updateMasterFacets',
    'LOAD_SIDE_EFFECTS_FACETS_SUCCESS': 'handleFacetSideEffects',
    'LOAD_FACETS_CONFIG': 'loadFacetConfigs',
    'CLEAR_FACETS_SUCCESS': 'clearFacets'
};

export default FacetedBrowserStore;
