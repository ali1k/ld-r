import {appFullTitle} from '../configs/general';
import loadDynamicFacetsConfig from './loadDynamicFacetsConfig';
import prepareFacetsFromQueryAPI from './prepareFacetsFromQueryAPI';
import async from 'async';

export default function loadFacets(context, payload, done) {
    //timer
    //let start, end, timeElapsed;
    //start = new Date().getTime();
    //dispatch action based on the parameter
    if(payload.mode === 'init'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        async.parallel([
            (cback) => {
                //dynamic config
                context.executeAction(loadDynamicFacetsConfig, payload, cback);
            },
            (cback) => {
                if(payload.apiFlag){
                    //prepare query and facets from a query API
                    context.executeAction(prepareFacetsFromQueryAPI, payload, cback);
                }else{
                    cback();
                }
            },
            (cback) => {
                //clear facets
                context.dispatch('CLEAR_FACETS_SUCCESS', {});
                context.service.read('facet.facetsSecondLevel', payload, {timeout: 50 * 1000}, function (err, res) {
                    //end = new Date().getTime();
                    //timeElapsed = end - start;
                    if (err) {
                        context.dispatch('LOAD_FACETS_FAILURE', err);
                    } else {
                        context.dispatch('LOAD_FACETS_RESOURCES_SUCCESS', res);
                    }
                    context.dispatch('UPDATE_PAGE_TITLE', {
                        pageTitle: (appFullTitle + ' | Faceted Browser | ' + decodeURIComponent(payload.id)) || ''
                    });
                    cback();
                });
            }
        ],
        // final callback
        (err, results) => {
            context.dispatch('LOADED_DATA', {});
            done();
        });

    }else if(payload.mode === 'master'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        async.parallel([
            (cback) => {
                //total number of items listed in facet
                context.service.read('facet.facetsMasterCount', payload, {timeout: 50 * 1000}, function (err, res) {
                    //end = new Date().getTime();
                    //timeElapsed = end - start;
                    if (err) {
                        context.dispatch('LOAD_FACETS_COUNT_FAILURE', err);
                    } else {
                        context.dispatch('LOAD_MASTER_FACETS_COUNT_SUCCESS', res);
                    }
                    cback();
                });
            },
            (cback) => {
                //items of facets
                context.service.read('facet.facetsMaster', payload, {timeout: 50 * 1000}, function (err, res) {
                    //end = new Date().getTime();
                    //timeElapsed = end - start;
                    if (err) {
                        context.dispatch('LOAD_FACETS_FAILURE', err);
                    } else {
                        context.dispatch('LOAD_MASTER_FACETS_SUCCESS', res);
                    }
                    cback();
                });
            }
        ],
        // final callback
        (err, results) => {
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }else if(payload.mode === 'masterMore'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        //items of facets
        context.service.read('facet.facetsMaster', payload, {timeout: 50 * 1000}, function (err, res) {
            //end = new Date().getTime();
            //timeElapsed = end - start;
            if (err) {
                context.dispatch('LOAD_FACETS_FAILURE', err);
            } else {
                context.dispatch('LOADED_DATA', {});
                context.dispatch('LOAD_MASTER_MORE_FACETS_SUCCESS', res);
            }
            done();
        });
    }else if(payload.mode === 'sideEffect'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        async.parallel([
            (cback) => {
                //total number of items listed in facet
                context.service.read('facet.facetsSideEffectCount', payload, {timeout: 50 * 1000}, function (err, res) {
                    //end = new Date().getTime();
                    //timeElapsed = end - start;
                    if (err) {
                        context.dispatch('LOAD_FACETS_FAILURE', err);
                    } else {
                        context.dispatch('LOAD_SIDE_EFFECTS_COUNT_FACETS_SUCCESS', res);
                    }
                    cback();
                });
            },
            (cback) => {
                //items of facets
                context.service.read('facet.facetsSideEffect', payload, {timeout: 50 * 1000}, function (err, res) {
                    //end = new Date().getTime();
                    //timeElapsed = end - start;
                    if (err) {
                        context.dispatch('LOAD_FACETS_FAILURE', err);
                    } else {
                        context.dispatch('LOAD_SIDE_EFFECTS_FACETS_SUCCESS', res);
                    }
                    cback();
                });
            }
        ],
        // final callback
        (err, results) => {
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }else if(payload.mode === 'second'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        context.service.read('facet.facetsSecondLevel', payload, {timeout: 50 * 1000}, function (err, res) {
            //end = new Date().getTime();
            //timeElapsed = end - start;
            if (err) {
                context.dispatch('LOAD_FACETS_FAILURE', err);
            } else {
                context.dispatch('LOAD_FACETS_RESOURCES_SUCCESS', res);
            }
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }

}
