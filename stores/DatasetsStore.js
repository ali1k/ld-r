import {BaseStore} from 'fluxible/addons';

class DatasetsStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.clearAll();
    }
    clearAll() {
        this.datasetsList = [];
    }
    loadDatasetsList(payload) {
        this.datasetsList = this.mergeDatasets(payload.dynamicReactorDS, payload.dynamicFacetsDS, payload.staticReactorDS, payload.staticFacetsDS);
        this.emitChange();
    }
    mergeDatasets(dynamicReactorDS, dynamicFacetsDS, staticReactorDS, staticFacetsDS) {
        let out = [];
        let tmp = {};
        for(let ds in staticReactorDS.dataset){
            if(tmp [ds]){
                //overwrite properties
                for(let prop in staticReactorDS.dataset[ds]){
                    tmp [ds][prop] = staticReactorDS.dataset[ds][prop];
                }
            }else{
                tmp [ds] = staticReactorDS.dataset[ds];
            }
        }
        for(let ds in staticFacetsDS.facets){
            if(tmp [ds]){
                //overwrite properties
                for(let prop in staticFacetsDS.facets[ds]){
                    tmp [ds][prop] = staticFacetsDS.facets[ds][prop];
                }
            }else{
                tmp [ds] = staticFacetsDS.facets[ds];
            }
            tmp [ds].isBrowsable = 1;
        }
        for(let ds in dynamicReactorDS.dataset){
            if(tmp [ds]){
                //overwrite properties
                for(let prop in dynamicReactorDS.dataset[ds]){
                    tmp [ds][prop] = dynamicReactorDS.dataset[ds][prop];
                }
                tmp [ds].isStaticDynamic = 1;
            }else{
                tmp [ds] = dynamicReactorDS.dataset[ds];
                tmp [ds].isDynamic = 1;
            }
        }
        for(let ds in dynamicFacetsDS.facets){
            if(tmp [ds]){
                //overwrite properties
                for(let prop in dynamicFacetsDS.facets[ds]){
                    tmp [ds][prop] = dynamicFacetsDS.facets[ds][prop];
                }
                tmp [ds].isStaticDynamic = 1;
            }else{
                tmp [ds] = dynamicFacetsDS.facets[ds];
                tmp [ds].isDynamic = 1;
            }
            tmp [ds].isBrowsable = 1;

        }
        for(let ds in tmp){
            out.push({d: ds, features: tmp[ds]});
        }
        return out;
    }

    getState() {
        return {
            datasetsList: this.datasetsList
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.datasetsList = state.datasetsList;
    }
}

DatasetsStore.storeName = 'DatasetsStore'; // PR open in dispatchr to remove this need
DatasetsStore.handlers = {
    'LOAD_DATASETS_SUCCESS': 'loadDatasetsList'
};

export default DatasetsStore;
