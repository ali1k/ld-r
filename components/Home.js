'use strict';
var React = require('react');

class Home extends React.Component {
    render() {
        return (
            <div className="ui page grid" ref="home">
              <div className="ui row">
                <div className="column">
                    <div className="ui segment content">
                        <h2 className="ui header">Linked Data Reactor</h2>
                        <p>
                            <img className="ui left floated image" src="/assets/img/ld-reactor.gif" alt="ld-reactor" />
                            Linked Data Reactor aims to build a set of reactive and reusable UI components to facilitate building Linked Data applications. LD-Reactor utilizes Facebook's <a href="https://facebook.github.io/react/">ReactJS</a> components, <a href="https://facebook.github.io/flux">Flux</a> architecture and Yahoo!'s <a href="http://fluxible.io/">Fluxible</a> framework for isomorphic web applications.
                            LD-Reactor applies the idea of component-based application development into RDF data model to enhance user interfaces to view, browse and edit Linked Data.
                        </p>
                    </div>
                </div>
                </div>
            </div>
        );
    }
}

module.exports = Home;
