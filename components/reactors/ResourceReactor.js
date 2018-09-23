import React from 'react';
import PropTypes from 'prop-types';
import {enableAuthentication} from '../../configs/general';
import ResourceStore from '../../stores/ResourceStore';
import {connectToStores} from 'fluxible-addons-react';
import Resource from '../resource/Resource';
import UserResource from '../resource/UserResource';
import PersonResource from '../resource/PersonResource';
import OrgResource from '../resource/OrgResource';
import CSVMappingResource from '../resource/CSVMappingResource';
import createProperty from '../../actions/createProperty';
import ReactDOM from 'react-dom';
import PrefixBasedInput from '../object/editor/individual/PrefixBasedInput';

class ResourceReactor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newPropURI: '',
            newObjetValue: ''
        };
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
    handleNewProperty(e) {
        let self = this;
        if(this.state.newPropURI && this.state.newObjetValue){
            this.context.executeAction(createProperty, {
                dataset: self.props.ResourceStore.datasetURI,
                resourceURI: self.props.ResourceStore.resourceURI,
                propertyURI: this.state.newPropURI,
                objectValue: this.state.newObjetValue
            });
        }
    }
    handleNewPropertyEdit(v) {
        this.setState({newPropURI: v.trim()});
    }
    handleNewObjectValueEdit(v) {
        this.setState({newObjetValue: v.trim()});
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
        let error = this.props.ResourceStore.error;
        let resourceReactor;
        if (config && config.resourceReactor) {
            switch (config.resourceReactor[0]) {
                case 'Resource':
                    resourceReactor = <Resource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])} error={error}/>;
                    break;
                case 'UserResource':
                    resourceReactor = <UserResource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])} error={error}/>;
                    break;
                case 'PersonResource':
                    resourceReactor = <PersonResource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])} error={error}/>;
                    break;
                case 'OrgResource':
                    resourceReactor = <OrgResource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])} error={error}/>;
                    break;
                case 'CSVMappingResource':
                    resourceReactor = <CSVMappingResource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])} error={error}/>;
                    break;
                default:
                    resourceReactor = <Resource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])} error={error}/>;
            }
        }else{
            resourceReactor = <Resource enableAuthentication={enableAuthentication} datasetURI={datasetURI} properties={properties} resource={resourceURI} resourceType={resourceType} title={title} currentCategory={currentCategory} propertyPath={propertyPath} config={this.configMinus(config, ['resourceReactor'])} error={error}/>;
        }
        let newPropDIV = '';
        if(!error && config && config.allowPropertyNew && !config.readOnly && (config.userIsCreator || config.userIsEditor)){
            newPropDIV =  <div className="ui fluid container ldr-padding-more"><div className="ui grid">
                <div className="ui column"><div className="ui grey message form">
                    <PrefixBasedInput includeOnly={['ldrProperties','properties']} noFocus={true} spec={{value:''}} onDataEdit={this.handleNewPropertyEdit.bind(this)} placeholder="Enter the URI of the property. You can use common prefixes e.g. foaf:name"/>
                    <PrefixBasedInput noFocus={true} spec={{value:''}} onDataEdit={this.handleNewObjectValueEdit.bind(this)} placeholder="Value of the property" onEnterPress={this.handleNewProperty.bind(this)} allowActionByKey={true}/>
                    <button className="fluid ui primary icon button" onClick={this.handleNewProperty.bind(this)}><i className="icon square add"></i>Add Property/Value</button>
                </div></div></div></div>;
        }
        let itemTypes = '';
        if(Array.isArray(resourceType)){
            itemTypes = resourceType.join(' ');
        }else{
            itemTypes = resourceType;
        }
        return (
            <div ref="resourceReactor" itemScope itemType={itemTypes} itemID={resourceURI}>
                {resourceReactor}
                {newPropDIV}
            </div>
        );
    }
}
ResourceReactor.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
ResourceReactor = connectToStores(ResourceReactor, [ResourceStore], function(context, props) {
    return {ResourceStore: context.getStore(ResourceStore).getState()};
});
export default ResourceReactor;
