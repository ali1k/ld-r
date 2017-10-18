export default function sendEmailMsg(context, payload, done) {
    context.service.read('admin.sendEmailMsg', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('SEND_EMAIL_MSG_FAILURE', err);
        } else {
            context.dispatch('SEND_EMAIL_MSG_SUCCESS', res);
        }
        done();
    });
}
