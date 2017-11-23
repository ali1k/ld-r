import getEnvState from './getEnvState';
import loadFacets from './loadFacets';
import async from 'async';

export default function getLoadEnvState(context, payload, done) {
    //used for loading progress indicator
    context.dispatch('LOADING_DATA', {});
    async.waterfall([
        (cback) => {
            context.executeAction(getEnvState, payload, cback);
        },
        (previousResult, cback) => {
            let stateObj ={};
            const ldr_prefix = 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#';
            let settingProp = '';
            previousResult.properties.forEach((item)=>{
                settingProp = item.propertyURI.replace(ldr_prefix, '').replace('http://www.w3.org/2000/01/rdf-schema#', '').trim();
                stateObj[settingProp]= decodeURIComponent(item.instances[0].value);
            });
            let selection = JSON.parse(stateObj.selection);
            let options = selection.options;
            let datasetConfig = {};
            if(options.datasetConfig){
                datasetConfig = options.datasetConfig;
            }
            let env = {stateURI: previousResult.resourceURI, desc: stateObj.label, searchTerm: stateObj.searchTerm, selection: selection.prevSelection, pivotConstraint: stateObj.pivotConstraint, id: payload.id,  invert: options.invert, range: options.range, datasetConfig: datasetConfig, analysisProps: options.analysisProps, page: stateObj.page};
            context.executeAction(loadFacets, {mode: 'envState', isPivotChange: env.isPivotChange, stateURI: env.stateURI, id: payload.id, searchTerm: env.searchTerm, page: env.page, pivotConstraint: env.pivotConstraint, selection: { prevSelection: selection.prevSelection, options: {invert: env.invert, range: env.range, analysisProps: env.analysisProps, facetConfigs: {}}}}, cback);
        }
    ],
    // final callback
    (err) => {
        if(err)
            console.log('error in loading env states', err);
        context.dispatch('LOADED_DATA', {});
        done();
    });

}
