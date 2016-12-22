export default function annotateText(context, payload, done) {
    context.service.read('dbpedia.spotlight', payload, {timeout: 20 * 1000}, function (err, res) {
        context.dispatch('UPDATE_ANNOTATION_TEXT', {currentText: payload.query});
        if (err) {
            context.dispatch('UPDATE_TEXT_ANNOTATION__FAILURE', err);
        } else {
            context.dispatch('UPDATE_ANNOTATION_TAGS', res);
        }
        done(res);
    });
}
