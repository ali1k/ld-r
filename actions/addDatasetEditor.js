import {navigateAction} from 'fluxible-router';
export default function addDatasetEditor(context, payload, done) {
    context.service.create('admin.datasetEditor', payload, {}, function (err, res) {
        done();
    });
}
