import {appFullTitle} from '../configs/general';

export default function loadFacets(context, payload, done) {
    //timer
    let start, end, timeElapsed;
    start = new Date().getTime();
    if(payload.clear){
        //clear facets
        context.dispatch('CLEAR_FACETS_SUCCESS', {});
    }else{
        //used for loading progress indicator
        context.dispatch('START_TASK_FACETS', {});
    }
    context.service.read('dataset.facets', payload, {timeout: 20 * 1000}, function (err, res) {
        end = new Date().getTime();
        timeElapsed = end - start;
        if (err) {
            context.dispatch('LOAD_FACETS_FAILURE', err);
        } else {
            context.dispatch('LOAD_FACETS_SUCCESS', res);
        }
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: (appFullTitle + ' | Faceted Browser | ' + payload.id) || ''
        });
        done();
    });
}
