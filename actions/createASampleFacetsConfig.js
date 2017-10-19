import {navigateAction} from 'fluxible-router';
export default function createASampleFacetsConfig(context, payload, done) {
    context.service.create('resource.newFacetsConfig', payload, {}, function (err, res) {
        if(payload.redirect || (payload.params && payload.params.redirect)){
            context.executeAction(navigateAction, {
                url: '/dataset/' + encodeURIComponent(res.datasetURI) + '/resource/' + encodeURIComponent(res.resourceURI)
            });
        }
        done();
    });
}
