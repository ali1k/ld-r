import {navigateAction} from 'fluxible-router';
import {baseResourceDomain} from '../configs/general';
import createNewReactorConfig from './createNewReactorConfig';

export default function createEmptyDataset(context, payload, done) {
    let newDatasetURI = payload.datasetURI;
    context.executeAction(createNewReactorConfig, {scope: 'D', dataset: newDatasetURI, resourceURI: '', propertyURI: '', options:{fromScratch: 1, datasetLabel: payload.datasetLabel}, redirect: 0}, function(err, res){
        context.service.create('resource.new', {dataset: newDatasetURI, isNewDataset: 1}, {}, function (err2, res2) {
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
