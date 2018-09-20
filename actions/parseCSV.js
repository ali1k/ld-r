export default function parseCSV(context, payload, done) {
    context.service.read('import.csvparse', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('READ_CSV_FAILURE', err);
            done();
        } else {
            context.dispatch('READ_CSV_SUCCESS', res);
            done();
        }
    });

}
