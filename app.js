import React from 'react';
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';

import Application from './components/Application';
import RouteStore from './stores/RouteStore';
import ApplicationStore from './stores/ApplicationStore';
import DatasetStore from './stores/DatasetStore';
import ResourceStore from './stores/ResourceStore';
import IndividualObjectStore from './stores/IndividualObjectStore';

let app = new Fluxible({
    component: Application,
    stores: [
        RouteStore,
        ApplicationStore,
        DatasetStore,
        ResourceStore,
        IndividualObjectStore
    ]
});

app.plug(fetchrPlugin({
    xhrPath: '/api' // Path for XHR to be served from
}));

module.exports = app;
