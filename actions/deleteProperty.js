import loadResource from './loadResource';

export default function deleteProperty(context, payload, done) {
    context.service.delete('resource.property', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('DELETE_PROPERTY_FAILURE', err);
            done();
        } else {
            //refresh the resource properties
            context.executeAction(loadResource, {dataset: payload.dataset, resource: payload.resourceURI, category: res.category, propertyPath: payload.propertyPath}, function(err2, res2){
                context.dispatch('DELETE_PROPERTY_SUCCESS', res);
                done();
            });
        }
    });
}
