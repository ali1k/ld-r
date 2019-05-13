/**
 * This leverages Express to create and run the http server.
 * A Fluxible context is created and executes the navigateAction
 * based on the URL. Once completed, the store state is dehydrated
 * and the application is rendered via React.
 */
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import path from 'path';
import serialize from 'serialize-javascript';
import {navigateAction} from 'fluxible-router';
import debugLib from 'debug';
import React from 'react';
import ReactDOM from 'react-dom/server';

import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import favicon from 'serve-favicon';
//required for authentication
import handleAuthentication from './plugins/authentication/handleAuth';
//required for file upload
import handleUpload from './plugins/import/handleUpload';
//required for export resources
import handleExport from './plugins/export/handleExport';
//required for generating docs
import handleDocumentation from './plugins/documentation/handleDocumentation';
import {enableAuthentication, uploadFolder} from './configs/general';
import cookieSession from 'cookie-session';
import hogan from 'hogan-express';
import serverConfig from './configs/server';
import app from './app';
import HtmlComponent from './components/DefaultHTMLLayout';
import { createElementWithContext } from 'fluxible-addons-react';

const env = process.env.NODE_ENV;
const htmlComponent = React.createFactory(HtmlComponent);
const debug = debugLib('linked-data-reactor');
const publicRoutes = ['/', '/about'];

const host = process.env.HOST ? process.env.HOST : 'localhost';
let port = 3000 ;
if(env === 'production'){
    port = process.env.PORT ? process.env.PORT : (serverConfig.serverPort ? serverConfig.serverPort[0] : 3000);
}else{
    port = process.env.PORT ? parseInt(process.env.PORT) + 1 : 3001;
}

const server = express();
// we need this because "cookie" is true in csrfProtection
server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieSession({
    name: 'LDR',
    keys: ['u1waegf234ss', 'u2wef23ed5325']
}));
// server.use(csrf({cookie: true}));
//for authentication: this part is external to the flux architecture
if(enableAuthentication){
    handleAuthentication(server);
}
//handling file upload
handleUpload(server);
//handling content export
handleExport(server);
//handling docs
handleDocumentation(server);
server.set('state namespace', 'App');
server.use(favicon(path.join(__dirname, '/favicon.ico')));
//--------used for views external to fluxible
server.set('views', path.join(__dirname, '/external_views'));
server.set('view engine', 'html');
server.set('view options', { layout: false });
//server.enable('view cache');
server.engine('html', hogan);
//------------------
server.use('/public', express.static(path.join(__dirname, '/build')));
//server.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));
//add frontend npm modules here
server.use('/json3', express.static(path.join(__dirname, '/node_modules/json3')));
server.use('/es5-shim', express.static(path.join(__dirname, '/node_modules/es5-shim')));
server.use('/es6-shim', express.static(path.join(__dirname, '/node_modules/es6-shim')));
server.use('/semantic-ui', express.static(path.join(__dirname, '/node_modules/semantic-ui-css')));
server.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery')));
server.use('/animate.css', express.static(path.join(__dirname, '/node_modules/animate.css')));
server.use('/leaflet', express.static(path.join(__dirname, '/node_modules/leaflet')));
server.use('/yasgui-yasqe', express.static(path.join(__dirname, '/node_modules/yasgui-yasqe')));
server.use('/codemirror', express.static(path.join(__dirname, '/node_modules/codemirror')));
server.use('/jqcloud2', express.static(path.join(__dirname, '/node_modules/jqcloud2')));

server.use('/assets', express.static(path.join(__dirname, '/assets')));
server.use('/uploaded', express.static(path.join(__dirname, uploadFolder[0].replace('\.', ''))));
// Get access to the fetchr plugin instance
let fetchrPlugin = app.getPlugin('FetchrPlugin');
// Register our services
fetchrPlugin.registerService(require('./services/dbpedia'));
fetchrPlugin.registerService(require('./services/dataset'));
fetchrPlugin.registerService(require('./services/resource'));
fetchrPlugin.registerService(require('./services/facet'));
fetchrPlugin.registerService(require('./services/admin'));
fetchrPlugin.registerService(require('./services/import'));
fetchrPlugin.registerService(require('./services/custom'));
// Set up the fetchr middleware
server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());
server.use(compression());
server.use(bodyParser.json());
server.use((req, res, next) => {
    //check user credentials
    //stop fluxible rendering if not authorized
    if(enableAuthentication){
        if(!req.isAuthenticated() && publicRoutes.indexOf(req.url) === -1){
            //store referrer in session
            req.session.redirectTo = req.url;
            return res.redirect('/login');
        }
    }
    const context = app.createContext({
        req: req // The fetchr plugin depends on this
        // xhrContext: {
        //     _csrf: req.csrfToken() // Make sure all XHR requests have the CSRF token
        // }
    });

    debug('Executing navigate action');
    context.getActionContext().executeAction(navigateAction, {
        url: req.url
    }, (err) => {
        if (err) {
            if (err.statusCode && err.statusCode === 404) {
                next();
            } else {
                next(err);
            }
            return;
        }

        debug('Exposing context state');
        const exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        debug('Rendering Application component into html');
        const markup = ReactDOM.renderToString(createElementWithContext(context));
        const htmlElement = React.createElement(HtmlComponent, {
            //clientFile: env === 'production' ? 'main.min.js' : 'main.js',
            //use main.js for both dev and prod modes
            clientFile: 'main.js',
            addAssets: (env === 'production'),
            context: context.getComponentContext(),
            state: exposed,
            markup: markup
        });
        const html = ReactDOM.renderToStaticMarkup(htmlElement);

        debug('Sending markup');
        res.type('html');
        res.write('<!DOCTYPE html>' + html);
        res.end();
    });
});

server.listen(port);
if(env === 'production'){
    console.log('[production environment] Check your application on http://%s:%s', host, port);
}else{
    console.log('[development environment] Proxy server listening on port ' + port);
    console.log('[development environment] Check your application on http://%s:%s', host, port-1);
}

export default server;
