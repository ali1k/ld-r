import {navigateAction} from 'fluxible-router';

export default function createResource(context, payload, done) {
    context.service.create('resource.new', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('CREATE_RESOURCE_FAILURE', err);
            done();
        } else {
            context.dispatch('CREATE_RESOURCE_SUCCESS', res);
            //navigate
            //open in a new tab in case of faceted browser
            if(payload.openInNewWindows){
                window.open('/dataset/' + encodeURIComponent(res.datasetURI) + '/resource/' + encodeURIComponent(res.resourceURI), '_blank');
            }else{
                context.executeAction(navigateAction, {
                    url: '/dataset/' + encodeURIComponent(res.datasetURI) + '/resource/' + encodeURIComponent(res.resourceURI)
                });
            }
            done();
        }
    });
}
