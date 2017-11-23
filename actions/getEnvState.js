import {configDatasetURI} from '../configs/general';

export default function getEnvState(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    context.service.read('resource.properties', {resource: payload.stateURI, dataset: configDatasetURI[0]}, {timeout: 40 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('UPDATE_ENV_STATE_FAILURE', err);
        } else {
            let res2 = res;
            res2.id = payload.id;
            context.dispatch('UPDATE_ENV_STATE', res2);
        }
        context.dispatch('LOADED_DATA', {});
        done(null, res);
    });
}
