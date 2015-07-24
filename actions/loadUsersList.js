import {appFullTitle} from '../configs/general';
export default function loadUsersList(context, payload, done) {
    context.service.read('admin.userslist', payload, {}, function (err, res) {
        if (err) {
            context.dispatch('LOAD_USERS_LIST_FAILURE', err);
        } else {
            context.dispatch('LOAD_USERS_LIST_SUCCESS', res);
        }
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: (appFullTitle + ' | Users') || ''
        });
        done();
    });
}
