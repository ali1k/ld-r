import React from 'react';
import BasicResourceList from './viewer/BasicResourceList';
import ScatterChartView from './viewer/ScatterChartView';
import TreeMapView from './viewer/TreeMapView';
import RadarChartView from './viewer/RadarChartView';
import BarChartView from './viewer/BarChartView';
import NetworkView from './viewer/NetworkView';

class DatasetViewer extends React.Component {
    render() {
        let viewer, viewerConfig = '';
        if(this.props.config){
            if(this.props.config.datasetViewer){
                viewerConfig = this.props.config.datasetViewer[0];
            }
        }
        switch(viewerConfig){
            case 'BasicResourceList':
                viewer = <BasicResourceList enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'ScatterChartView':
                viewer = <ScatterChartView enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'TreeMapView':
                viewer = <TreeMapView enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'RadarChartView':
                viewer = <RadarChartView enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'BarChartView':
                viewer = <BarChartView enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'NetworkView':
                viewer = <NetworkView enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            default:
                viewer = <BasicResourceList enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
        }
        return (
            <div className="ui" ref="datasetViewer">
                {viewer}
            </div>
        );
    }
}

export default DatasetViewer;
