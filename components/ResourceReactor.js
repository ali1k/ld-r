import React from 'react';
import {enableAuthentication} from '../configs/reactor';
import ResourceStore from '../stores/ResourceStore';
import {connectToStores} from 'fluxible-addons-react';
import Resource from './Resource';
class ResourceReactor extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let graphName = this.props.ResourceStore.graphName;
        let properties = this.props.ResourceStore.properties;
        let resourceURI = this.props.ResourceStore.resourceURI;
        let resourceType = this.props.ResourceStore.resourceType;
        let title = this.props.ResourceStore.title;
        let currentCategory = this.props.ResourceStore.currentCategory;
        let propertyPath = this.props.ResourceStore.propertyPath;
        let config = this.props.ResourceStore.config;
        let resourceReactor;
        console.log(config);
        /*
        if(config){
            switch(config.resourceReactor[0]){
                case 'Resource':
                    resourceReactor = <Resource enableAuthentication={enableAuthentication} graphName={graphName} properties={properties}  resourceURI={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])}/>;
                break;
                default:
                    resourceReactor = <Resource enableAuthentication={enableAuthentication} graphName={graphName} properties={properties}  resourceURI={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])}/>;
            }
        }
        */
        return (
            <div ref="resourceReactor">
                {resourceReactor}
            </div>
        );
    }
}
ResourceReactor.contextTypes = {
    getUser: React.PropTypes.func
};
ResourceReactor = connectToStores(ResourceReactor, [ResourceStore], function (context, props) {
    return {
        ResourceStore: context.getStore(ResourceStore).getState()
    };
});
export default ResourceReactor;
