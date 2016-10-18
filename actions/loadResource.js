import {appFullTitle} from '../configs/general';
export default function loadResource(context, payload, done) {
    context.dispatch('START_TASK_RESOURCE', {});
    context.service.read('resource.properties', payload, {timeout: 15 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('LOAD_RESOURCE_FAILURE', err);
        } else {
            context.dispatch('CLEAN_RESOURCE_SUCCESS', res);
            context.dispatch('CLEAN_GMAP_SUCCESS', res);
            context.dispatch('LOAD_RESOURCE_SUCCESS', res);
        }
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: (appFullTitle + ' | Dataset | ' + decodeURIComponent(payload.dataset) + ' | Resource | ' + decodeURIComponent(payload.resource) + ' | Category | ' + payload.category) || ''
        });
        done();
    });
}
