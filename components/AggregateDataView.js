import React from 'react';
import BasicAggregateView from './BasicAggregateView';

class AggregateDataView extends React.Component {
    render() {
        let viewer;
        switch(this.props.config? (this.props.config.viewer? this.props.config.viewer[0]:'') : ''){
            case 'BasicIndividualView':
                viewer = <BasicAggregateView spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                viewer = <BasicAggregateView spec={this.props.spec} config={this.props.config}/>;
        }
        return (
            <div className="ui" ref="aggregateDataView">
                {viewer}
            </div>
        );
    }
}

export default AggregateDataView;
