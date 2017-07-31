import React from 'react';
import ResourceList from './ResourceList';

class DatasetViewer extends React.Component {
    render() {
        let viewer, viewerConfig = '';
        if(this.props.config){
            if(this.props.config.datasetViewer){
                viewerConfig = this.props.config.datasetViewer[0];
            }
        }
        switch(viewerConfig){
            case 'ResourceList':
                viewer = <ResourceList enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource}/>;
                break;
            default:
                viewer = <ResourceList enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={this.props.isBig} config={this.props.config} cloneable={this.props.cloneable} onCloneResource={this.props.onCloneResource}/>;
        }
        return (
            <div className="ui" ref="datasetViewer">
                {viewer}
            </div>
        );
    }
}

export default DatasetViewer;
