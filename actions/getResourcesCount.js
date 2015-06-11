export default function getResourcesCount(context, payload, done) {
    context.service.read('dataset.countResourcesByType', payload, {timeout: 20 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_DATASET_TOTAL_FAILURE', err);
        } else {
            context.dispatch('UPDATE_DATASET_TOTAL_SUCCESS', res);
        }
        done();
    });
}
