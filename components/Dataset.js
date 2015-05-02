import React from 'react';
import Resource from './Resource';

class Dataset extends React.Component {
    render() {
        return (
            <div className="ui page grid" ref="dataset">
                <Resource />
            </div>
        );
    }
}

export default Dataset;
