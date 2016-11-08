import {appFullTitle} from '../configs/general';
import loadDynamicFacetsConfig from './loadDynamicFacetsConfig';

export default function loadFacets(context, payload, done) {
    //timer
    //let start, end, timeElapsed;
    //start = new Date().getTime();
    //dispatch action based on the parameter
    if(payload.mode === 'init'){
        //dynamic config
        context.executeAction(loadDynamicFacetsConfig, payload);
        //clear facets
        context.dispatch('CLEAR_FACETS_SUCCESS', {});
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        context.service.read('facet.facetsSecondLevel', payload, {timeout: 20 * 1000}, function (err, res) {
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
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }else if(payload.mode === 'master'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        context.service.read('facet.facetsMaster', payload, {timeout: 20 * 1000}, function (err, res) {
            //end = new Date().getTime();
            //timeElapsed = end - start;
            if (err) {
                context.dispatch('LOAD_FACETS_FAILURE', err);
            } else {
                context.dispatch('LOAD_MASTER_FACETS_SUCCESS', res);
            }
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }else if(payload.mode === 'sideEffect'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        context.service.read('facet.facetsSideEffect', payload, {timeout: 20 * 1000}, function (err, res) {
            //end = new Date().getTime();
            //timeElapsed = end - start;
            if (err) {
                context.dispatch('LOAD_FACETS_FAILURE', err);
            } else {
                context.dispatch('LOAD_SIDE_EFFECTS_FACETS_SUCCESS', res);
            }
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }else if(payload.mode === 'second'){
        //used for loading progress indicator
        context.dispatch('LOADING_DATA', {});
        context.service.read('facet.facetsSecondLevel', payload, {timeout: 20 * 1000}, function (err, res) {
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
