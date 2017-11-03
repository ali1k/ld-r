import {appFullTitle} from '../configs/general';

export default function loadEnvStates(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    let pageTitle = 'Datasets';
    if(payload.pageTitle){
        pageTitle = payload.pageTitle;
    }
    context.service.read('resource.envStates', payload, {timeout: 40 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_QUERIES_SAVED_FAILURE', err);
        } else {
            context.dispatch('UPDATE_QUERIES_SAVED', res);
        }
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: (appFullTitle + ' | '+ pageTitle) || ''
        });
        context.dispatch('LOADED_DATA', {});
        done();
    });
}
