import {navigateAction} from 'fluxible-router';
import {baseResourceDomain} from '../configs/general';
import createNewReactorConfig from './createNewReactorConfig';

export default function createFromExistingDataset(context, payload, done) {
    let newDatasetURI = payload.datasetURI;
    context.executeAction(createNewReactorConfig, {scope: 'D', dataset: newDatasetURI, resourceURI: '', propertyURI: '', options:{fromScratch: 0, datasetLabel: payload.datasetLabel}, redirect: 0}, function(err, res){
        context.service.create('resource.newServerConfig', {dataset: newDatasetURI, isNewDataset: 1, options:{host: payload.host, port: payload.port, path: payload.path, graphName: payload.graphName, endpointType: payload.endpointType, datasetLabel: payload.datasetLabel}}, {}, function (err2, res2) {
            if (err) {
                context.dispatch('CREATE_DATASET_FAILURE', err2);
                done();
            } else {
                context.dispatch('CREATE_DATASET_SUCCESS', res2);
                //navigate
                context.executeAction(navigateAction, {
                    url: '/dataset/1/' + encodeURIComponent(res2.datasetURI)
                });
                done();
            }
        });
    });

}
