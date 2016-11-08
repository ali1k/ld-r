import React from 'react';
import {enableAuthentication} from '../../configs/general';
import ResourceStore from '../../stores/ResourceStore';
import {connectToStores} from 'fluxible-addons-react';
import Resource from '../resource/Resource';
import PersonResource from '../resource/PersonResource';
class ResourceReactor extends React.Component {
    constructor(props) {
        super(props);
    }
    //removes properties from an object
    configMinus(config, props) {
        let o = {};
        for (let p in config) {
            if (props.indexOf(p) === -1) {
                o[p] = config[p];
            }
        }
        return o;
    }
    render() {
        let datasetURI = this.props.ResourceStore.datasetURI;
        let properties = this.props.ResourceStore.properties;
        let resourceURI = this.props.ResourceStore.resourceURI;
        let resourceType = this.props.ResourceStore.resourceType;
        let title = this.props.ResourceStore.title;
        let currentCategory = this.props.ResourceStore.currentCategory;
        let propertyPath = this.props.ResourceStore.propertyPath;
        let config = this.props.ResourceStore.config;
        let resourceReactor;
        if (config && config.resourceReactor) {
            switch (config.resourceReactor[0]) {
                case 'Resource':
                    resourceReactor = <Resource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])}/>;
                    break;
                case 'PersonResource':
                    resourceReactor = <PersonResource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])}/>;
                    break;
                default:
                    resourceReactor = <Resource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])}/>;
            }
        }

        return (
            <div ref="resourceReactor">
                {resourceReactor}
            </div>
        );
    }
}
ResourceReactor.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
ResourceReactor = connectToStores(ResourceReactor, [ResourceStore], function(context, props) {
    return {ResourceStore: context.getStore(ResourceStore).getState()};
});
export default ResourceReactor;
