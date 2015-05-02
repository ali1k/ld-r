export default function loadResource(context, payload, done) {
    context.dispatch('UPDATE_PAGE_TITLE', {
        pageTitle: ('Linked Data Reactor | Dataset | ' + payload.dataset + ' | Resource | '+payload.resource + ' | Category | '+payload.category) || ''
    });
    done();
}
