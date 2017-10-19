import React from 'react';
import PropTypes from 'prop-types';
import ObjectIViewer from '../../ObjectIViewer';
/**
Default component to display multiple object values as aggregate
*/
class BasicAggregateView extends React.Component {
    render() {
        let self = this;
        let list = this.props.spec.instances.map(function(node, index) {
            if(!node){
                return undefined; // stop processing this iteration
            }
            return (<div key={index} className="item"><ObjectIViewer spec={node} config={self.props.config}/></div>);
        });
        return (
            <div className="ui horizontal list" ref="basicAggregateView">
                {list}
            </div>
        );
    }
}
BasicAggregateView.propTypes = {
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default BasicAggregateView;
