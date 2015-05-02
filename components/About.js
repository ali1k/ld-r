import React from 'react';

class About extends React.Component {
    render() {
        return (
            <div className="ui page grid" ref="about">
              <div className="ui row">
                <div className="column">
                    <div className="ui content">
                        <h2 className="ui header">About</h2>
                        <p> LD-Reactor is an attempt to create reactive & reusable Linked Data components!</p>
                    </div>
                </div>
                </div>
            </div>
        );
    }
}

export default About;
