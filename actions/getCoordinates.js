export default function getCoordinates(context, payload, done) {
    context.service.read('dbpedia.coordinates', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('FIND_COORDINATES_FAILURE', err);
        } else {
            context.dispatch('FIND_COORDINATES_SUCCESS', res);
        }
        done();
    });
}
