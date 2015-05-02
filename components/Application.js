/*globals document*/

import React from 'react';
import Nav from './Nav';
import Home from './Home';
import About from './About';
import ApplicationStore from '../stores/ApplicationStore';
import {RouterMixin} from 'flux-router-component';
import provideContext from 'fluxible/addons/provideContext';
import connectToStores from 'fluxible/addons/connectToStores';

// @TODO Upgrade to ES6 class when RouterMixin is replaces
var Application = React.createClass({
    mixins: [RouterMixin],
    render: function () {
        var output = '';
        switch (this.props.currentPageName) {
            case 'home':
                output = <Home/>;
                break;
            case 'about':
                output = <About/>;
                break;
        }
        return (
            <div>
                <Nav selected={this.props.currentPageName} links={this.props.pages} />
                {output}
            </div>
        );
    },

    componentDidUpdate: function(prevProps, prevState) {
        const newProps = this.props;
        if (newProps.pageTitle === prevProps.pageTitle) {
            return;
        }
        document.title = newProps.pageTitle;
    }
});

export default provideContext(connectToStores(
    Application,
    [ApplicationStore],
    function (stores, props) {
        var appStore = stores.ApplicationStore;
        return {
            currentPageName: appStore.getCurrentPageName(),
            pageTitle: appStore.getPageTitle(),
            route: appStore.getCurrentRoute(),
            pages: appStore.getPages()
        };
    }
));
