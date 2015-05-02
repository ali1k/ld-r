import loadDataset from '../actions/loadDataset';
import loadResource from '../actions/loadResource';

export default {
    home: {
        path: '/',
        method: 'get',
        handler: require('../components/Home'),
        label: 'LD-Reactor',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Linked Data Reactor | Home'});
            done();
        }
    },
    about: {
        path: '/about',
        method: 'get',
        handler: require('../components/About'),
        label: 'About',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Linked Data Reactor | About'});
            done();
        }
    },
    dataset: {
        path: '/dataset/:id',
        method: 'get',
        handler: require('../components/Dataset'),
        label: 'Dataset',
        action: (context, payload, done) => {
            context.executeAction(loadDataset, { id: payload.get('params').get('id')}, done);
        }
    },
    resource: {
        path: '/dataset/:did/resource/:rid/:pcategory?',
        method: 'get',
        handler: require('../components/Resource'),
        label: 'Resource',
        action: (context, payload, done) => {
            //predicate Category
            var category;
            if (payload.get('params').get('pcategory')) {
                category = payload.get('params').get('pcategory');
            } else {
                category = 'general';
            }
            context.executeAction(loadResource, { dataset: payload.get('params').get('did'), resource: payload.get('params').get('rid'), category: category}, done);
        }
    }
};
