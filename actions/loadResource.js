export default function loadResource(context, payload, done) {
    context.service.read('resource.properties', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('LOAD_RESOURCE_FAILURE', err);
        } else {
            context.dispatch('CLEAN_RESOURCE_SUCCESS', res);
            context.dispatch('CLEAN_GMAP_SUCCESS', res);
            context.dispatch('LOAD_RESOURCE_SUCCESS', res);
        }
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: ('Linked Data Reactor | Dataset | ' + decodeURIComponent(payload.dataset) + ' | Resource | '+ decodeURIComponent(payload.resource) + ' | Category | '+payload.category) || ''
        });
        done();
    });
}
