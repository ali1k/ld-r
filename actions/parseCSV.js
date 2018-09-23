export default function parseCSV(context, payload, done) {
    context.dispatch('CLEAR_IMPORT_CONFFIG_SUCCESS', {});
    context.service.read('import.csvparse', payload, {timeout: 30 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('READ_CSV_FAILURE', err);
            done();
        } else {
            context.dispatch('READ_CSV_SUCCESS', res);
            done();
        }
    });

}
