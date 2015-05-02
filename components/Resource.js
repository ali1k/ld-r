import React from 'react';
import Predicate from './Predicate';

class Resource extends React.Component {
    render() {
        return (
            <div className="ui page grid" ref="resource">
                <Predicate />
            </div>
        );
    }
}

export default Resource;
