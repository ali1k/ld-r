import {navigateAction} from 'fluxible-router';
import {baseResourceDomain} from '../configs/general';

export default function createDataset(context, payload, done) {
    let newDatasetURI = baseResourceDomain[0] + '/d' + Math.round(+new Date() / 1000);
    //do not add two slashes
    if(baseResourceDomain[0].slice(-1) === '/'){
        newDatasetURI = baseResourceDomain[0] + 'd' + Math.round(+new Date() / 1000);
    }
    context.service.create('dataset.newReactorConfig', {dataset: newDatasetURI}, {}, function (err, res) {
        context.service.create('resource.new', {dataset: newDatasetURI}, {}, function (err2, res2) {
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
