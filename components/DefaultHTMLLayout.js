'use strict';
import React from 'react';
import ApplicationStore from '../stores/ApplicationStore';
import ga from '../plugins/googleAnalytics/ga';
import {googleAnalyticsID} from '../configs/general';

class DefaultHTMLLayout extends React.Component {
    render() {
        return (
            <html>
            <head>
                <meta charSet="utf-8" />
                <title>{this.props.context.getStore(ApplicationStore).getPageTitle()}</title>
                <meta name="viewport" content="width=device-width, user-scalable=no" />
                <link href="/semantic-ui/semantic.min.css" rel="stylesheet" type="text/css" />
                <link href="/animate.css/animate.min.css" rel="stylesheet" type="text/css" />
                {/* Vendors css bundle */
                    this.props.addAssets ? <link href="/public/css/vendor.bundle.css" rel="stylesheet" type="text/css" />: <style></style>
                }
                <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>

            </head>
            <body>
                <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
                <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
                {/* Following are added only to support IE browser */}
                <script src="/es5-shim/es5-shim.min.js"></script>
                <script src="/es5-shim/es5-sham.min.js"></script>
                <script src="/json3/lib/json3.min.js"></script>
                <script src="/es6-shim/es6-shim.min.js"></script>
                <script src="/es6-shim/es6-sham.min.js"></script>
                {/* Above are added only to support IE browser */}
                <script src="/jquery/dist/jquery.min.js"></script>
                <script src="/semantic-ui/components/transition.min.js"></script>
                <script src="/semantic-ui/components/popup.min.js"></script>
                <script src="/semantic-ui/components/dropdown.min.js"></script>
                <script src="/semantic-ui/components/checkbox.min.js"></script>
                <script src="/semantic-ui/components/dimmer.min.js"></script>
                <script src="/semantic-ui/components/modal.min.js"></script>
                {/* All external vendors bundle*/
                    this.props.addAssets ? <script src={'/public/js/vendor.bundle.js'}></script> : ''}
                {/* Main app bundle */}
                <script src={'/public/js/' + this.props.clientFile}></script>
                { googleAnalyticsID && <script dangerouslySetInnerHTML={ {__html: ga.replace('{googleAnalyticsID}', googleAnalyticsID)} } /> }
            </body>
            </html>
        );
    }
}

module.exports = DefaultHTMLLayout;
