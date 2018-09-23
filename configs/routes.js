import loadDatasets from '../actions/loadDatasets';
import loadDataset from '../actions/loadDataset';
import loadResource from '../actions/loadResource';
import loadUsersList from '../actions/loadUsersList';
import loadFacets from '../actions/loadFacets';
import loadEnvStates from '../actions/loadEnvStates';
import getLoadEnvState from '../actions/getLoadEnvState';
import {appFullTitle, appShortTitle, authDatasetURI, baseResourceDomain} from '../configs/general';

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
    importCSV: {
        path: '/importCSV',
        method: 'get',
        handler: require('../components/import/CSVImport'),
        label: 'CSVImport',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: appFullTitle + ' | Import CSV files'});
            done();
        }
    },
    newDataset: {
        path: '/newDataset',
        method: 'get',
        handler: require('../components/NewDataset'),
        label: 'NewDataset',
        action: (context, payload, done) => {
            context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: appFullTitle + ' | Add a new dataset'});
            done();
        }
    },
    annotateDataset: {
        path: '/annotateDataset',
        method: 'get',
        handler: require('../components/DatasetAnnotation'),
        label: 'DatasetAnnotation',
        action: (context, payload, done) => {
            context.executeAction(loadDatasets, {pageTitle: 'Annotate a dataset'}, done);
        }
    },
    wysiwyq: {
        path: '/wysiwyq',
        method: 'get',
        handler: require('../components/WYSIWYQ'),
        label: 'ImportQuery',
        action: (context, payload, done) => {
            context.executeAction(loadEnvStates, {pageTitle: 'Import a Query | WYSIWYQ mode'}, done);
        }
    },
    facets: {
        path: '/browse/:id?/:stateURI?',
        method: 'get',
        handler: require('../components/dataset/FacetedBrowser'),
        label: 'Faceted Browser',
        action: (context, payload, done) => {
            let datasetURI, page, stateURI;
            datasetURI = payload.params.id;
            stateURI = payload.params.stateURI;
            if (!datasetURI) {
                datasetURI = 0;
            }
            if (!stateURI) {
                //only init if no state is given
                stateURI = 0;
                context.executeAction(loadFacets, {mode: 'init', id: decodeURIComponent(datasetURI), stateURI: stateURI, selection: 0, page: 1}, done);
            }else{
                //get && load the given state
                context.executeAction(getLoadEnvState, {mode: 'init', id: decodeURIComponent(datasetURI), stateURI: stateURI, selection: 0, page: 1}, done);
            }
        }
    },
    datasets: {
        //if no id is provided -> will start by defaultDatasetURI in reactor.config
        path: '/datasets',
        method: 'get',
        handler: require('../components/Datasets'),
        label: 'Datasets',
        action: (context, payload, done) => {
            context.executeAction(loadDatasets, {}, done);
        }
    },
    dataset: {
        //if no id is provided -> will start by defaultDatasetURI in reactor.config
        path: '/dataset/:page?/:id?',
        method: 'get',
        handler: require('../components/reactors/DatasetReactor'),
        label: 'Dataset',
        action: (context, payload, done) => {
            let datasetURI, page;
            datasetURI = decodeURIComponent(payload.params.id);
            if (!datasetURI) {
                datasetURI = 0;
            }
            page = payload.params.page;
            if (!page) {
                page = 1;
            }
            //do not allow to browse user graph
            if(datasetURI===authDatasetURI[0]){
                datasetURI = 0
            }
            context.executeAction(loadDataset, { id: datasetURI, page: page}, done);
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
            let datasetURI = payload.params.did;
            if (!datasetURI) {
                datasetURI = 0;
            }
            context.executeAction(loadResource, { dataset: decodeURIComponent(datasetURI), resource: decodeURIComponent(payload.params.rid), category: category, propertyPath: propertyPath}, done);
        }
    },
    user: {
        path: '/user/:id',
        method: 'get',
        handler: require('../components/reactors/ResourceReactor'),
        label: 'User',
        action: (context, payload, done) => {
            let category = 0;
            context.executeAction(loadResource, { dataset: authDatasetURI[0], resource: baseResourceDomain + '/user/' + decodeURIComponent(payload.params.id), category: category}, done);
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
