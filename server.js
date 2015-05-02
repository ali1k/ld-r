/**
 * This leverages Express to create and run the http server.
 * A Fluxible context is created and executes the navigateAction
 * based on the URL. Once completed, the store state is dehydrated
 * and the application is rendered via React.
 */

import express from 'express';
import csrf from 'csurf';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import favicon from 'serve-favicon';
import path from 'path';
import serialize from 'serialize-javascript';
import {navigateAction} from 'fluxible-router';
import debugLib from 'debug';
import React from 'react';
import generalConfig from './configs/general';
import app from './app';
import HtmlComponent from './components/DefaultHTMLLayout';
const htmlComponent = React.createFactory(HtmlComponent);

const debug = debugLib('linked-data-reactor');

const server = express();
// we need this because "cookie" is true in csrfProtection
server.use(cookieParser());
server.use(bodyParser.json());
server.use(csrf({cookie: true}));
server.set('state namespace', 'App');
server.use(favicon(path.join(__dirname, '/favicon.ico')));
server.use('/public', express.static(path.join(__dirname, '/build')));
server.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));
server.use('/assets', express.static(path.join(__dirname, '/assets')));
// Get access to the fetchr plugin instance
let fetchrPlugin = app.getPlugin('FetchrPlugin');
// Register our services
fetchrPlugin.registerService(require('./services/dbpedia'));
fetchrPlugin.registerService(require('./services/dataset'));
// Set up the fetchr middleware
server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

server.use((req, res, next) => {
    let context = app.createContext({
        req: req, // The fetchr plugin depends on this
        xhrContext: {
            _csrf: req.csrfToken() // Make sure all XHR requests have the CSRF token
        }
    });

    debug('Executing navigate action');
    context.getActionContext().executeAction(navigateAction, {
        url: req.url
    }, (err) => {
        if (err) {
            if (err.status && err.status === 404) {
                next();
            } else {
                next(err);
            }
            return;
        }

        debug('Exposing context state');
        const exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        debug('Rendering Application component into html');
        const html = React.renderToStaticMarkup(htmlComponent({
            context: context.getComponentContext(),
            state: exposed,
            markup: React.renderToString(context.createElement())
        }));

        debug('Sending markup');
        res.type('html');
        res.write('<!DOCTYPE html>' + html);
        res.end();
    });
});

const port = process.env.PORT || generalConfig.serverPort[0];
server.listen(port);
console.log('Listening on port ' + port);

export default server;
