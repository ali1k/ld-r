export default function saveFacetsEnvState(context, payload, done) {
    //console.log(payload);
    context.dispatch('LOADING_DATA', {});
    context.service.create('resource.newEnvState', payload, {timeout: 30 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('NEW_ENV_STATE_FAILURE', err);
        } else {
            context.dispatch('NEW_ENV_STATE_SUCCESS', res);
        }
        context.dispatch('LOADED_DATA', {});
        done();
    });
}
