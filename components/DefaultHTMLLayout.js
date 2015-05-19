'use strict';
var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');

class DefaultHTMLLayout extends React.Component {
    render() {
        return (
            <html>
            <head>
                <meta charSet="utf-8" />
                <title>{this.props.context.getStore(ApplicationStore).getPageTitle()}</title>
                <meta name="viewport" content="width=device-width, user-scalable=no" />
                <link href="/bower_components/semantic-ui/dist/semantic.min.css" rel="stylesheet" type="text/css" />
                <link href="/bower_components/animate.css/animate.min.css" rel="stylesheet" type="text/css" />
                <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>
            </head>
            <body>
                <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
            </body>
            <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
            <script src="/bower_components/jquery/dist/jquery.min.js"></script>
            <script src="/bower_components/semantic-ui/dist/components/transition.min.js"></script>
            <script src="/bower_components/semantic-ui/dist/components/popup.min.js"></script>
            <script src="/bower_components/semantic-ui/dist/components/dropdown.min.js"></script>
            <script src="/bower_components/semantic-ui/dist/components/checkbox.min.js"></script>
            <script src="/bower_components/semantic-ui/dist/components/dimmer.min.js"></script>
            <script src="/bower_components/semantic-ui/dist/components/modal.min.js"></script>
            <script src="/public/js/main.js"></script>
            </html>
        );
    }
}

module.exports = DefaultHTMLLayout;
