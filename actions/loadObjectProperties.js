export default function loadObjectProperties(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    context.service.read('resource.objectProperties', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('LOAD_OBJECT_PROPERTIES_FAILURE', err);
        } else {
            context.dispatch('LOAD_OBJECT_PROPERTIES_SUCCESS', res);
        }
        context.dispatch('LOADED_DATA', {});
        done();
    });
}
