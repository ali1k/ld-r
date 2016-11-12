import {navigateAction} from 'fluxible-router';

export default function createResource(context, payload, done) {
    context.service.create('resource.new', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('CREATE_RESOURCE_FAILURE', err);
            done();
        } else {
            context.dispatch('CREATE_RESOURCE_SUCCESS', res);
            //navigate
            context.executeAction(navigateAction, {
                url: '/dataset/' + encodeURIComponent(res.datasetURI) + '/resource/' + encodeURIComponent(res.resourceURI)
            });
            done();
        }
    });
}
