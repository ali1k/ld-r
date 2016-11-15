import {navigateAction} from 'fluxible-router';
export default function createASampleFacetsConfig(context, payload, done) {
    context.service.create('dataset.newFacetsConfig', payload, {}, function (err, res) {
        context.executeAction(navigateAction, {
            url: '/dataset/' + encodeURIComponent(res.datasetURI) + '/resource/' + encodeURIComponent(res.resourceURI)
        });
        done();
    });
}
