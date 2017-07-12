export default function getClassFrequency(context, payload, done) {
    context.service.read('dataset.classFrequency', payload, {timeout: 20 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('LOAD_CLASS_FREQUENCY_ERROR', err);
        } else {
            context.dispatch('LOAD_CLASS_FREQUENCY', res);
        }
        done(null, res);
    });
}
