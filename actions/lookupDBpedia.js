export default function lookupDBpedia(context, payload, done) {
    context.service.read('dbpedia.lookup', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('LOOKUP_DBPEDIA_FAILURE', err);
        } else {
            context.dispatch('LOOKUP_DBPEDIA_SUCCESS', res);
        }
        done();
    });
}
