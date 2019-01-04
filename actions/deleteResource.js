import {navigateAction} from 'fluxible-router';
export default function deleteResource(context, payload, done) {
    context.service.delete('resource.delete', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('DELETE_RESOURCE_FAILURE', err);
            done();
        } else {
            context.executeAction(navigateAction, {
                url: '/dataset/1/' + encodeURIComponent(res.datasetURI)
            });
            done();
        }
    });
}
