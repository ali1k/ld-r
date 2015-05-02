'use strict';
var React = require('react');

class Home extends React.Component {
    render() {
        return (
            <div className="ui page grid" ref="home">
              <div className="ui row">
                <div className="column">
                    <div className="ui content">
                        <h2 className="ui header">Home</h2>
                        <p>
                            Welcome to LD-Reactor!
                            <img className="ui image" src="/assets/img/ld-reactor.gif" />
                        </p>
                    </div>
                </div>
                </div>
            </div>
        );
    }
}

module.exports = Home;
