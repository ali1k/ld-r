import loadDataset from '../actions/loadDataset';
import loadResource from '../actions/loadResource';
import loadUsersList from '../actions/loadUsersList';
import loadFacets from '../actions/loadFacets';
import {appFullTitle, appShortTitle, authGraphName, baseResourceDomain} from '../configs/general';

export default {
    home: {
        path: '/',
        method: 'get',
        handler: require('../components/Home'),
        label: appShortTitle,
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: appFullTitle + ' | Home'});
            done();
        }
    },
    about: {
        path: '/about',
        method: 'get',
        handler: require('../components/About'),
        label: 'About',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: appFullTitle + ' | About'});
            done();
        }
    },
    facets: {
        path: '/browse/:id?',
        method: 'get',
        handler: require('../components/FacetedBrowser'),
        label: 'Faceted Browser',
        action: (context, payload, done) => {
            let graphName, page;
            graphName = payload.params.id;
            if (!graphName) {
                graphName = 0;
            }
            context.executeAction(loadFacets, {mode: 'init', id: graphName, selection: 0, page: 1}, done);
        }
    },
    datasets: {
        //if no id is provided -> will start by defaultGraphName in reactor.config
        path: '/datasets',
        method: 'get',
        handler: require('../components/Datasets'),
        label: 'Datasets',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: appFullTitle + ' | Datasets'});
            done();
        }
    },
    dataset: {
        //if no id is provided -> will start by defaultGraphName in reactor.config
        path: '/dataset/:page?/:id?',
        method: 'get',
        handler: require('../components/reactors/DatasetReactor'),
        label: 'Dataset',
        action: (context, payload, done) => {
            let graphName, page;
            graphName = payload.params.id;
            page = payload.params.page;
            if (!graphName) {
                graphName = 0;
            }
            if (!page) {
                page = 1;
            }
            context.executeAction(loadDataset, { id: graphName, page: page}, done);
        }
    },
    resource: {
        path: '/dataset/:did/:resource/:rid/:pcategory?/:propertyPath?',
        method: 'get',
        handler: require('../components/reactors/ResourceReactor'),
        label: 'Resource',
        action: (context, payload, done) => {
            //predicate Category
            let category = payload.params.pcategory;
            if(!category){
                category = 0;
            }
            let propertyPath = payload.params.propertyPath;
            if(!propertyPath){
                propertyPath = [];
            }
            let graphName = payload.params.did;
            if (!graphName) {
                graphName = 0;
            }
            context.executeAction(loadResource, { dataset: graphName, resource: decodeURIComponent(payload.params.rid), category: category, propertyPath: propertyPath}, done);
        }
    },
    user: {
        path: '/user/:id',
        method: 'get',
        handler: require('../components/reactors/ResourceReactor'),
        label: 'User',
        action: (context, payload, done) => {
            let category = 0;
            context.executeAction(loadResource, { dataset: authGraphName, resource: baseResourceDomain + '/user/' + decodeURIComponent(payload.params.id), category: category}, done);
        }
    },
    users: {
        path: '/users',
        method: 'get',
        handler: require('../components/admin/UsersList'),
        label: 'Users List',
        action: (context, payload, done) => {
            context.executeAction(loadUsersList, {}, done);
        }
    }
};
