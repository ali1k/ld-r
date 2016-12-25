export default function annotateText(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    context.service.read('dbpedia.spotlight', payload, {timeout: 20 * 1000}, function (err, res) {
        if (err) {
            let error_res = {tags: [], id: payload.id, msg: err};
            context.dispatch('UPDATE_TEXT_ANNOTATION__FAILURE', error_res);
        } else {
            context.dispatch('UPDATE_ANNOTATION_TAGS', res);
        }
        context.dispatch('LOADED_DATA', {});
        done(null, res);
    });
}
