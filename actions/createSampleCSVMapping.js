import {navigateAction} from 'fluxible-router';
export default function createSampleCSVMapping(context, payload, done) {
    context.service.create('import.csvmapping', payload, {timeout: 30 * 1000}, function (err, res) {
        if (err) {
            context.dispatch('CREATE_CSV_MAPPING_FAILURE', err);
            done();
        } else {
            context.executeAction(navigateAction, {
                url: '/dataset/' + encodeURIComponent(res.d) + '/resource/' + encodeURIComponent(res.r)
            });
            done();
        }
    });

}
