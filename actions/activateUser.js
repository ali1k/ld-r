import loadUsersList from './loadUsersList';

export default function activateUser(context, payload, done) {
    context.service.update('admin.activateUser', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('ACTIVATE_USER_FAILURE', err);
        } else {
            context.dispatch('ACTIVATE_USER_SUCCESS', res);
        }
        //refresh the users list
        context.executeAction(loadUsersList, {}, function(err2, res2){
            context.dispatch('LOAD_USERS_LIST_SUCCESS', res2);
            done();
        });
        done();
    });
}
