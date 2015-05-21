import React from 'react';
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';
import authPlugin from './plugins/authentication';
import Application from './components/Application';
import RouteStore from './stores/RouteStore';
import ApplicationStore from './stores/ApplicationStore';
import DatasetStore from './stores/DatasetStore';
import ResourceStore from './stores/ResourceStore';
import IndividualObjectStore from './stores/IndividualObjectStore';
import DBpediaStore from './stores/DBpediaStore';
import DBpediaGMapStore from './stores/DBpediaGMapStore';

let app = new Fluxible({
    component: Application,
    stores: [
        RouteStore,
        ApplicationStore,
        DatasetStore,
        ResourceStore,
        IndividualObjectStore,
        DBpediaStore,
        DBpediaGMapStore
    ]
});

app.plug(fetchrPlugin({
    xhrPath: '/api' // Path for XHR to be served from
}));
app.plug(authPlugin({}));

module.exports = app;
