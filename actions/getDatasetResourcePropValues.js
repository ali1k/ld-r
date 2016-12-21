export default function getDatasetResourcePropValues(context, payload, done) {
    context.service.read('dataset.resourceProp', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_DATASET_RPV__FAILURE', err);
        } else {
            context.dispatch('UPDATE_DATASET_RPV_SUCCESS', res);
        }
        done(res);
    });
}
