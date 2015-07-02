import React from 'react';
import BasicAggregateView from './BasicAggregateView';
import DBpediaGoogleMapView from './more/DBpediaGoogleMapView';


class AggregateDataView extends React.Component {
    render() {
        let viewer, viewerConfig = '';
        if(this.props.config){
            if(this.props.config.viewer){
                viewerConfig = this.props.config.viewer[0];
            }
        }
        switch(viewerConfig){
            case 'BasicAggregateView':
                viewer = <BasicAggregateView property={this.props.property} spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'DBpediaGoogleMapView':
                viewer = <DBpediaGoogleMapView spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                viewer = <BasicAggregateView property={this.props.property} spec={this.props.spec} config={this.props.config}/>;
        }
        return (
            <div className="ui" ref="aggregateDataView">
                {viewer}
            </div>
        );
    }
}

export default AggregateDataView;
