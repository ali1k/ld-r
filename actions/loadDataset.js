export default function loadDataset(context, payload, done) {
    context.service.read('dataset.resourcesByType', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('LOAD_DATASET_FAILURE', err);
        } else {
            context.dispatch('LOAD_DATASET_SUCCESS', res);
        }
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: ('Linked Data Reactor | Dataset | ' + payload.id) || ''
        });
        done();
    });
}
