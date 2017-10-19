export default function createResourceAnnotation(context, payload, done) {
    context.service.create('resource.annotate', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('CREATE_RESOURCE_ANNOTATION_FAILURE', err);
            done(err, res);
        } else {
            context.dispatch('CREATE_RESOURCE_ANNOTATION_SUCCESS', res);
            done(null, res);
        }
    });
}
