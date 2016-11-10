import loadResource from './loadResource';

export default function createProperty(context, payload, done) {
    context.service.create('resource.property', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('CREATE_PROPERTY_FAILURE', err);
            done();
        } else {
            //refresh the resource properties
            context.executeAction(loadResource, {dataset: res.dataset, resource: res.resourceURI, category: res.category, propertyPath: res.propertyPath}, function(err2, res2){
                context.dispatch('CREATE_PROPERTY_SUCCESS', res);
                done();
            });
        }
    });
}
