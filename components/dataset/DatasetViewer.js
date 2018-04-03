import React from 'react';
import BasicResourceList from './viewer/BasicResourceList';
import ScatterChartView from './viewer/ScatterChartView';
import TreeMapView from './viewer/TreeMapView';
import RadarChartView from './viewer/RadarChartView';
import BarChartView from './viewer/BarChartView';
import NetworkView from './viewer/NetworkView';
import TimelineView from './viewer/TimelineView';

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
                viewer = <BasicResourceList expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} facetConfigs={this.props.facetConfigs} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'ScatterChartView':
                viewer = <ScatterChartView expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'TreeMapView':
                viewer = <TreeMapView expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'RadarChartView':
                viewer = <RadarChartView expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'BarChartView':
                viewer = <BarChartView expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'NetworkView':
                viewer = <NetworkView expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            case 'TimelineView':
                viewer = <TimelineView expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
                break;
            default:
                viewer = <BasicResourceList expanded={this.props.expanded} enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} facetConfigs={this.props.facetConfigs} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource} OpenInNewTab={this.props.OpenInNewTab}/>;
        }
        return (
            <div className="ui" ref="datasetViewer">
                {viewer}
            </div>
        );
    }
}

export default DatasetViewer;
