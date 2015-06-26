import loadResource from './loadResource';

export default function deleteAggObject(context, payload, done) {
    context.service.delete('resource.aggObject', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('DELETE_AGG_OBJECT_FAILURE', err);
            done();
        } else {
            //refresh the resource properties
            context.executeAction(loadResource, {dataset: payload.dataset, resource: payload.resourceURI, category: res.category, propertyPath: payload.propertyPath}, function(err2, res2){
                context.dispatch('DELETE_AGG_OBJECT_SUCCESS', res);
                done();
            });
        }
    });
}
