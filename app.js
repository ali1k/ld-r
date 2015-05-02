import Fluxible from 'fluxible';
import routrPlugin from 'fluxible-plugin-routr';
import Application from './components/Application';
import routes from './configs/routes';
import ApplicationStore from './stores/ApplicationStore';

// create new fluxible instance
const app = new Fluxible({
    component: Application
});

// add routes to the routr plugin
app.plug(routrPlugin({
    routes: routes
}));

// register stores
app.registerStore(ApplicationStore);

module.exports = app;
