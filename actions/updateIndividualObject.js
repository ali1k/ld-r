import loadResource from './loadResource';

export default function updateIndividualObject(context, payload, done) {
    context.service.update('resource.individualObject', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_OBJECT_FAILURE', err);
            done();
        } else {
            //refresh the resource properties
            context.executeAction(loadResource, {dataset: payload.dataset, resource: payload.resourceURI, category: res.category, propertyPath: payload.propertyPath}, function(err2, res2){
                context.dispatch('UPDATE_INDIVIDUAL_OBJECT_SUCCESS', res);
                done();
            });
        }
    });
}
