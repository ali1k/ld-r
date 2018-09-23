export default function createJSONLD(context, payload, done) {
    context.service.create('import.jsonld', payload, {timeout: 120 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('CREATE_JSONLD_FAILURE', err);
            done();
        } else {
            context.dispatch('CREATE_JSONLD_SUCCESS', res);
            done();
        }
    });

}
