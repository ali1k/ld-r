export default function cloneResource(context, payload, done) {
    context.service.create('resource.clone', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('CLONE_RESOURCE_FAILURE', err);
            done();
        } else {
            console.log(res);
            done();
        }
    });
}
