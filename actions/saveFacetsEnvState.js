export default function saveFacetsEnvState(context, payload, done) {
    console.log(payload);
    context.dispatch('LOADING_DATA', {});
    context.dispatch('LOADED_DATA', {});
    done();
}
