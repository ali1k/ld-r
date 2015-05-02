export default function loadDataset(context, payload, done) {
    context.dispatch('UPDATE_PAGE_TITLE', {
        pageTitle: ('Linked Data Reactor | Dataset | ' + payload.id) || ''
    });
    done();
}
