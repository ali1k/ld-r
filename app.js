import React from 'react';
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';

import Application from './components/Application';
import RouteStore from './stores/RouteStore';
import ApplicationStore from './stores/ApplicationStore';

let app = new Fluxible({
    component: Application,
    stores: [
        RouteStore,
        ApplicationStore
    ]
});

app.plug(fetchrPlugin({
    xhrPath: '/api' // Path for XHR to be served from
}));

module.exports = app;
