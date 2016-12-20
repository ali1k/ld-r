export default function annotateText(context, payload, done) {
    context.service.read('dbpedia.spotlight', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_TEXT_ANNOTATION__FAILURE', err);
        } else {
            context.dispatch('UPDATE_TEXT_ANNOTATION_SUCCESS', res);
        }
        done();
    });
}
