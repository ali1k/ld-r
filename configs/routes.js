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
        //if no id is provided -> will start by defaultGraphName in reactor.config
        path: '/dataset/:id?',
        method: 'get',
        handler: require('../components/Dataset'),
        label: 'Dataset',
        action: (context, payload, done) => {
            let graphName;
            graphName = payload.get('params').get('id');
            if (!graphName) {
                graphName = 'default';
            }
            context.executeAction(loadDataset, { id: graphName}, done);
        }
    },
    resource: {
        path: '/dataset/:did/resource/:rid/:pcategory?',
        method: 'get',
        handler: require('../components/Resource'),
        label: 'Resource',
        action: (context, payload, done) => {
            //predicate Category
            let category;
            category = payload.get('params').get('pcategory');
            if (!category) {
                category = 'default';
            }
            context.executeAction(loadResource, { dataset: decodeURIComponent(payload.get('params').get('did')), resource: decodeURIComponent(payload.get('params').get('rid')), category: category}, done);
        }
    }
};
