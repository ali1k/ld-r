export default function searchInDataset(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    if(payload.selection){
        context.service.read('facet.facetsSecondLevel', payload, {timeout: 50 * 1000}, function (err, res) {
            //end = new Date().getTime();
            //timeElapsed = end - start;
            if (err) {
                context.dispatch('LOAD_FACETS_FAILURE', err);
            } else {
                context.dispatch('LOAD_FACETS_RESOURCES_SUCCESS', res);
            }
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }else{
        context.service.read('dataset.resourcesByType', payload, {timeout: 50 * 1000}, function (err, res) {
            if (err) {
                context.dispatch('LOAD_DATASET_FAILURE', err);
            } else {
                context.dispatch('LOAD_DATASET_SUCCESS', res);
            }
            context.dispatch('LOADED_DATA', {});
            done();
        });
    }
}
