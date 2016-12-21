export default function getAnnotatedResourcesCount(context, payload, done) {
    context.service.read('dataset.countResourcePropAnnotation', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_ANNOTATED_RESOURCE_COUNT__FAILURE', err);
        } else {
            context.dispatch('UPDATE_ANNOTATED_RESOURCE_COUNT_SUCCESS', res);
        }
        done(res);
    });
}
