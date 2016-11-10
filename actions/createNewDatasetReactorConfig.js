export default function createNewDatasetReactorConfig(context, payload, done) {
    context.service.create('dataset.newReactorConfig', payload, {}, function (err, res) {
        done();
    });
}
