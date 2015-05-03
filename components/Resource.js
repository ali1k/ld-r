import React from 'react';
import Property from './Property';

class Resource extends React.Component {
    render() {
        return (
            <div className="ui page grid" ref="resource">
                <div className="ui column">
                    <div className="ui segment">
                        <h3> Resource</h3>
                        <Property />
                    </div>
                </div>
            </div>
        );
    }
}

export default Resource;
