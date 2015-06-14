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
                                Linked Data Reactor (LD-Reactor or LD-R) is a framework to develop <b>reactive</b> and <b>reusable</b> User Interface components for <b>Linked Data applications</b>. LD-Reactor utilizes Facebook's <a href="https://facebook.github.io/react/">ReactJS</a> components, <a href="https://facebook.github.io/flux">Flux</a> architecture and Yahoo!'s <a href="http://fluxible.io/">Fluxible</a> framework for isomorphic Web applications.
                                It also exploits <a href="http://semantic-ui.com/"> Semantic-UI </a> framework for flexible UI themes.
                                LD-Reactor aims to apply the idea of component-based application development into <a href="http://www.w3.org/RDF/">RDF</a> data model hence enhancing current user interfaces to view, browse and edit <a href="http://linkeddata.org/">Linked Data</a>.<br/> More information is available at <a href="http://ld-r.org">ld-r.org</a>.
                            </p>
                    </div>
                </div>
              </div>
            </div>
        );
    }
}

module.exports = Home;
