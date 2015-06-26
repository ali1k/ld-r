import React from 'react';
import IndividualPropertyReactor from './IndividualPropertyReactor';
import {propertiesConfig, enableAuthentication} from '../configs/reactor';
import ResourceStore from '../stores/ResourceStore';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';

class Resource extends React.Component {
    constructor(props) {
        super(props);
    }
    includesProperty(list, resource, property) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource && el.p === property){
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource, property) {
        if(enableAuthentication) {
            if(user){
                if(parseInt(user.isSuperUser)){
                    return {access: true, type: 'full'};
                }else{
                    if(graph && user.editorOfGraph.indexOf(graph) !== -1){
                        return {access: true, type: 'full'};
                    }else{
                        if(resource && user.editorOfResource.indexOf(resource) !== -1){
                            return {access: true, type: 'full'};
                        }else{
                            if(property && this.includesProperty(user.editorOfProperty, resource, property)){
                                return {access: true, type: 'partial'};
                            }else{
                                return {access: false};
                            }
                        }
                    }
                }
            }else{
                return {access: false};
            }
        }else{
            return {access: true, type: 'full'};
        }
    }
    buildConfigFromExtensions(extensions) {
        let config = {};
        extensions.forEach(function(el, i) {
            config[el.spec.propertyURI] = el.config;
        });
        return config;
    }
    render() {
        let readOnly;
        let user = this.context.getUser();
        let self = this;
        let selectedConfig, rightConfig, accessLevel, isWriteable, configReadOnly;
        //first check if there is a specific config for the property on the selected graphName
        selectedConfig = propertiesConfig[self.props.ResourceStore.graphName];
        //if no specific config is found, get the generic config
        if(!selectedConfig){
            selectedConfig = propertiesConfig.generic;
        }
        let propertyPath = self.props.ResourceStore.propertyPath;
        //handle properties config in different levels
        //todo: now only handles level 2 properties should be extended later if needed
        rightConfig = selectedConfig;
        if(propertyPath && propertyPath.length){
            //only two level supported for now
            if(selectedConfig.config && selectedConfig.config[propertyPath] && selectedConfig.config[propertyPath].extensions){
                rightConfig = {config: self.buildConfigFromExtensions(selectedConfig.config[propertyPath].extensions)};
            }
        }
        //if readOnly is not defined make it true
        if(typeof selectedConfig.readOnly === 'undefined'){
            readOnly = 1;
        }else{
            //get readOnly property for the graphName
            readOnly = selectedConfig.readOnly;
        }
        //create a list of properties
        let list = this.props.ResourceStore.properties.map(function(node, index) {
            //if there was no config at all or it is hidden, do not render the property
            if(!selectedConfig.config[node.propertyURI] || !selectedConfig.config[node.propertyURI].isHidden){
                //will use config from generic if no config for property was found
                if(!rightConfig.config[node.propertyURI] && propertiesConfig.generic.config[node.propertyURI]){
                    rightConfig.config[node.propertyURI] = propertiesConfig.generic.config[node.propertyURI];
                }
                //for readOnly, we first check the defautl value then we check readOnly value of each property if exists
                //this is what comes from the config
                if(readOnly){
                    configReadOnly = true;
                }else{
                    //the super user can edit all visible properties even readOnly ones!
                    if(user && parseInt(user.isSuperUser)){
                        configReadOnly = false;
                    }else{
                        //it property is readOnly from config
                        if(rightConfig.config[node.propertyURI]){
                            if(rightConfig.config[node.propertyURI].readOnly){
                                configReadOnly = true;
                            }else{
                                //check access levels
                                accessLevel = self.checkAccess(user, self.props.ResourceStore.graphName, self.props.ResourceStore.resourceURI, node.propertyURI);
                                if(accessLevel.access){
                                    configReadOnly = false;
                                }else{
                                    configReadOnly = true;
                                }
                            }
                        }else{
                            //check access levels
                            accessLevel = self.checkAccess(user, self.props.ResourceStore.graphName, self.props.ResourceStore.resourceURI, node.propertyURI);
                            if(accessLevel.access){
                                configReadOnly = false;
                            }else{
                                configReadOnly = true;
                            }
                        }
                    }
                }
                return (
                    <IndividualPropertyReactor key={index} spec={node} readOnly={configReadOnly} config={rightConfig.config[node.propertyURI]} graphName={self.props.ResourceStore.graphName} resource={self.props.ResourceStore.resourceURI}/>
                );
            }
        });
        let currentCategory, mainDIV, tabsDIV, tabsContentDIV;
        //categorize properties in different tabs
        if(selectedConfig.useCategories){
            currentCategory = this.props.ResourceStore.currentCategory;
            if(!currentCategory){
                currentCategory = selectedConfig.categories[0];
            }
            tabsDIV = selectedConfig.categories.map(function(node, index) {
                return (
                    <NavLink key={index} routeName="resource" href={'/dataset/' + encodeURIComponent(self.props.ResourceStore.graphName) + '/resource/' + encodeURIComponent(self.props.ResourceStore.resourceURI) + '/' + node + '/' + encodeURIComponent(self.props.ResourceStore.propertyPath)}>
                      <div className={(node === currentCategory ? 'item link active' : 'item link')}> {node} </div>
                    </NavLink>
                );
            });
            tabsContentDIV = selectedConfig.categories.map(function(node, index) {
                return (
                    <div key={index} className={(node === currentCategory ? 'ui bottom attached tab segment active' : 'ui bottom attached tab segment')}>
                        <div className="ui grid">
                            <div className="column ui list">
                                {list}
                            </div>
                        </div>
                    </div>
                );
            });
            mainDIV = <div>
                        <div className="ui top attached tabular menu">
                            {tabsDIV}
                        </div>
                        {tabsContentDIV}
                      </div>;
        }else{
            mainDIV = <div className="ui segment">
                            <div className="ui grid">
                                <div className="column ui list">
                                    {list}
                                </div>
                            </div>
                      </div>;
        }
        return (
            <div className="ui page grid" ref="resource">
                <div className="ui column">
                    <h2>
                        {this.props.ResourceStore.isComplete ? '' : <img src="/assets/img/loader.gif" alt="loading..."/>}
                        <a target="_blank" href={'/export/NTriples/' + encodeURIComponent(this.props.ResourceStore.graphName) + '/' + encodeURIComponent(this.props.ResourceStore.resourceURI)}><i className="black icon cube"></i></a> <a href={this.props.ResourceStore.resourceURI} target="_blank">{this.props.ResourceStore.title}</a>
                    </h2>
                    {mainDIV}
                </div>
            </div>
        );
    }
}
Resource.contextTypes = {
    getUser: React.PropTypes.func
};
Resource = connectToStores(Resource, [ResourceStore], function (stores, props) {
    return {
        ResourceStore: stores.ResourceStore.getState()
    };
});
export default Resource;
