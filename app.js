import React from 'react';
import Fluxible from 'fluxible';
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

module.exports = app;
