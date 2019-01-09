import {navigateAction} from 'fluxible-router';
export default function importCSV(context, payload, done) {
    context.service.create('import.jsonld', payload, {timeout: 120 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('IMPORT_CSV_FAILURE', err);
            done();
        } else {
            context.dispatch('IMPORT_CSV_SUCCESS', res);
            context.executeAction(navigateAction, {
                url: '/dataset/1/' + encodeURIComponent(res.datasetURI)
            });
            done();
        }
    });

}
