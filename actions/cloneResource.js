import {navigateAction} from 'fluxible-router';
export default function cloneResource(context, payload, done) {
    context.service.create('resource.clone', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('CLONE_RESOURCE_FAILURE', err);
            done();
        } else {
            //window.open('/dataset/' + encodeURIComponent(res.datasetURI) + '/resource/' + encodeURIComponent(res.resourceURI), '_blank');
            context.executeAction(navigateAction, {
                url: '/dataset/' + encodeURIComponent(res.datasetURI) + '/resource/' + encodeURIComponent(res.resourceURI)
            });
            done();
        }
    });
}
