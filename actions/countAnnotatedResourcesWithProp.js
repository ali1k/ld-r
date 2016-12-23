export default function countAnnotatedResourcesWithProp(context, payload, done) {
    context.service.read('dataset.countAnnotatedResourcesWithProp', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_ANNOTATION_STAT_ANNOTATED__FAILURE', err);
        } else {
            context.dispatch('UPDATE_ANNOTATION_STAT_ANNOTATED', res);
        }
        done(null, res);
    });
}
