import loadResource from './loadResource';

export default function createIndividualObject(context, payload, done) {
    context.service.create('resource.individualObject', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('CREATE_OBJECT_FAILURE', err);
            done();
        } else {
            //refresh the resource properties
            context.executeAction(loadResource, {dataset: payload.dataset, resource: payload.resourceURI, category: res.category, propertyPath: payload.propertyPath}, function(err2, res2){
                context.dispatch('CREATE_INDIVIDUAL_OBJECT_SUCCESS', res);
                done();
            });
        }
    });
}
