import React from 'react';
import BasicAggregateView from './viewer/aggregate/BasicAggregateView';
import DBpediaMapView from './viewer/aggregate/DBpediaMapView';
import BasicAggregateMapView from './viewer/aggregate/BasicAggregateMapView';


class ObjectAViewer extends React.Component {
    render() {
        let viewer, viewerConfig = '';
        if(this.props.config){
            if(this.props.config.objectAViewer){
                viewerConfig = this.props.config.objectAViewer[0];
            }
        }
        switch(viewerConfig){
            case 'BasicAggregateView':
                viewer = <BasicAggregateView property={this.props.property} spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'DBpediaMapView':
                viewer = <DBpediaMapView spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'BasicAggregateMapView':
                viewer = <BasicAggregateMapView spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                viewer = <BasicAggregateView property={this.props.property} spec={this.props.spec} config={this.props.config}/>;
        }
        return (
            <div className="ui" ref="objectAViewer">
                {viewer}
            </div>
        );
    }
}

export default ObjectAViewer;
