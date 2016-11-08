export default function loadDynamicFacetsConfig(context, payload, done) {
    context.service.read('facet.dynamicConfig', payload, {timeout: 20 * 1000}, function (err, res) {
        context.dispatch('LOAD_DYNAMIC_FACETS_CONFIG', res);
        done();
    });

}
