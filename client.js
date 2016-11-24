/*global document, window */
import ReactDOM from 'react-dom';
import React from 'react';
import debug from 'debug';
import { createElementWithContext } from 'fluxible-addons-react';
import app from './app';
import { AppContainer } from 'react-hot-loader';

const debugClient = debug('ld-r');
let dehydratedState = window.App; // Sent from the server

window.React = ReactDOM; // For chrome dev tool support

// expose debug object to browser, so that it can be enabled/disabled from browser:
// https://github.com/visionmedia/debug#browser-support
window.fluxibleDebug = debug;

debugClient('rehydrating app');

// pass in the dehydrated server state from server.js
app.rehydrate(dehydratedState, (err, context) => {
    if (err) {
        throw err;
    }
    window.context = context;
    const mountNode = document.getElementById('app');

    debugClient('React Rendering');
    ReactDOM.render(
        <AppContainer>{createElementWithContext(context)}</AppContainer>,
        mountNode,
        () => debugClient('React Rendered')
    );
});
//todo: fix some minor bugs here

//for react hot loader
if (module.hot) {
    module.hot.accept('./app', () => {
        // If you use Webpack 2 in ES modules mode, you can
        // use <App /> here rather than require() a <NextApp />.
        let NextApp = require('./app');
        dehydratedState = window.App;
        // pass in the dehydrated server state from server.js
        NextApp.rehydrate(dehydratedState, (err, context) => {
            if (err) {
                throw err;
            }
            window.context = context;
            const mountNode = document.getElementById('app');
            debugClient('React Hot Rendering');
            ReactDOM.render(
                <AppContainer>{createElementWithContext(context)}</AppContainer>,
                mountNode,
                () => debugClient('React Hot Rendered')
            );
        });
    });
}
