import {appFullTitle} from '../configs/general';
import async from 'async';
import getResourcesCount from './getResourcesCount';

export default function loadDataset(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    //load all required actions in parallel
    async.parallel([
        (callback) => {
            context.service.read('dataset.resourcesByType', payload, {timeout: 20 * 1000}, function (err, res) {
                if (err) {
                    context.dispatch('LOAD_DATASET_FAILURE', err);
                } else {
                    context.dispatch('LOAD_DATASET_SUCCESS', res);
                }
                callback();
            });
        },
        (callback) => {
            context.executeAction(getResourcesCount, {id: payload.id}, callback);
        }
    ],
    // final callback
    (err, results) => {
        if (err){
            return;
        }
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: (appFullTitle + ' | Dataset | ' + payload.id) || ''
        });
        context.dispatch('LOADED_DATA', {});
        done();
    });
}
