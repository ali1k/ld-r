import React from 'react';
import BasicAggregateView from './viewer/aggregate/BasicAggregateView';
import DBpediaGoogleMapView from './viewer/aggregate/DBpediaGoogleMapView';


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
            case 'DBpediaGoogleMapView':
                viewer = <DBpediaGoogleMapView spec={this.props.spec} config={this.props.config}/>;
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
