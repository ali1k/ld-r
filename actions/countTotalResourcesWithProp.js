export default function countTotalResourcesWithProp(context, payload, done) {
    context.service.read('dataset.countTotalResourcesWithProp', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_ANNOTATION_STAT_TOTAL__FAILURE', err);
        } else {
            context.dispatch('UPDATE_ANNOTATION_STAT_TOTAL', res);
        }
        done(res);
    });
}
