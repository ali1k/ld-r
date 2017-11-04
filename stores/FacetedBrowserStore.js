import {BaseStore} from 'fluxible/addons';

class FacetedBrowserStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.clearFacets();
    }
    clearAll() {
        this.facets = {};
        this.facetsCount = {};
        this.resources = [];
        this.total = 0;
        //query used to generate the result list
        this.resourceQuery = '';
        //queries used to display the values of each property facet
        this.facetQuery = {};
        //all the filters and constraints applied to the facet: used for pivot change
        this.facetQueryConstraints = {};
        this.envState = [];
        this.page = 1;
        this.datasetURI = '';
        this.datasetConfig= {};
        this.config = {};
        this.error = '';
        this.importedEnvState = 0;
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
        this.datasetURI = payload.datasetURI;
        this.resourceQuery = payload.resourceQuery;
        this.error = payload.error;
        this.emitChange();
    }
    switchToEnvState(payload){
        this.importedEnvState = payload.stateURI;
        this.emitChange();
    }
    updateMasterFacets(payload) {
        //for master facet
        if(payload.facets.status){
            this.facets[payload.facets.propertyURI] = payload.facets.items;
            this.facetQuery[payload.facets.propertyURI] = payload.facets.facetQuery;
            this.facetQueryConstraints[payload.facets.propertyURI] = payload.facets.facetQueryConstraints;
        }else{
            delete this.facets[payload.facets.propertyURI];
            delete this.facetQuery[payload.facets.propertyURI];
            delete this.facetQueryConstraints[payload.facets.propertyURI];
        }
        this.page = payload.page;
        this.datasetURI = payload.datasetURI;
        this.emitChange();
    }
    updateMoreMasterFacets(payload){
        this.facets[payload.facets.propertyURI] = this.facets[payload.facets.propertyURI].concat(payload.facets.items);
        this.facetQuery[payload.facets.propertyURI] = payload.facets.facetQuery;
        this.facetQueryConstraints[payload.facets.propertyURI] = payload.facets.facetQueryConstraints;
        this.emitChange();
    }
    updateMasterFacetsCount(payload) {
        this.facetsCount[payload.propertyURI] = payload.total;
        this.emitChange();
    }
    loadMasterFacetsFromState(payload) {
        this.datasetURI = payload.id;
        this.config ={list: [], config: {}};
        for(let prop in payload.selection){
            this.facets[prop] = payload.selection[prop];
            this.facetsCount[prop] = payload.selection[prop].length;
            if(this.config.list.indexOf(prop) === -1){
                this.config.list.push(prop);
            }
        }
        this.emitChange();
    }
    updateEnvState(payload){
        let stateObj ={};
        const ldr_prefix = 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#';
        let settingProp = '';
        payload.properties.forEach((item)=>{
            settingProp = item.propertyURI.replace(ldr_prefix, '').replace('http://www.w3.org/2000/01/rdf-schema#', '').trim();
            stateObj[settingProp]= decodeURIComponent(item.instances[0].value);
        });
        let selection = JSON.parse(stateObj.selection);
        let options = selection.options;
        this.page = stateObj.page;
        this.envState.push({stateURI: payload.resourceURI, desc: stateObj.label, searchTerm: stateObj.searchTerm, selection: selection.prevSelection, pivotConstraint: stateObj.pivotConstraint, id: this.datasetURI,  invert: options.invert, range: options.range, analysisProps: options.analysisProps, page: stateObj.page});
        this.emitChange();
    }
    handleFacetSideEffectsCount(payload) {
        this.facetsCount[payload.propertyURI] = payload.total;
        this.emitChange();
    }
    handleFacetSideEffects(payload) {
        this.facets[payload.facets.propertyURI] = payload.facets.items;
        this.facetQuery[payload.facets.propertyURI] = payload.facets.facetQuery;
        this.facetQueryConstraints[payload.facets.propertyURI] = payload.facets.facetQueryConstraints;
        this.page = payload.page;
        this.datasetURI = payload.datasetURI;
        this.emitChange();
    }
    getState() {
        return {
            facets: this.facets,
            facetsCount: this.facetsCount,
            datasetURI: this.datasetURI,
            datasetConfig: this.datasetConfig,
            config: this.config,
            resources: this.resources,
            total: this.total,
            resourceQuery: this.resourceQuery,
            facetQuery: this.facetQuery,
            facetQueryConstraints: this.facetQueryConstraints,
            page: this.page,
            importedEnvState: this.importedEnvState,
            envState: this.envState,
            error: this.error
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.facets = state.facets;
        this.facetsCount = state.facetsCount;
        this.datasetURI = state.datasetURI;
        this.datasetConfig = state.datasetConfig;
        this.config = state.config;
        this.resources = state.resources;
        this.total = state.total;
        this.page = state.page;
        this.resourceQuery = state.resourceQuery;
        this.facetQuery = state.facetQuery;
        this.facetQueryConstraints = state.facetQueryConstraints;
        this.error = state.error;
        this.importedEnvState = state.importedEnvState;
        this.envState = state.envState;
    }
}

FacetedBrowserStore.storeName = 'FacetedBrowserStore'; // PR open in dispatchr to remove this need
FacetedBrowserStore.handlers = {
    'LOAD_FACETS_RESOURCES_SUCCESS': 'updateFacetResources',
    'LOAD_MASTER_FACETS_SUCCESS': 'updateMasterFacets',
    'LOAD_MASTER_MORE_FACETS_SUCCESS': 'updateMoreMasterFacets',
    'LOAD_MASTER_FACETS_COUNT_SUCCESS': 'updateMasterFacetsCount',
    'LOAD_MASTER_FROM_STATE_SUCCESS': 'loadMasterFacetsFromState',
    'SWITCH_TO_ENV_STATE': 'switchToEnvState',
    'UPDATE_ENV_STATE': 'updateEnvState',
    'LOAD_SIDE_EFFECTS_FACETS_SUCCESS': 'handleFacetSideEffects',
    'LOAD_SIDE_EFFECTS_COUNT_FACETS_SUCCESS': 'handleFacetSideEffectsCount',
    'LOAD_FACETS_CONFIG': 'loadFacetConfigs',
    'CLEAR_FACETS_SUCCESS': 'clearFacets'
};

export default FacetedBrowserStore;
