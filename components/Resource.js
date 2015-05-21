import React from 'react';
import Property from './Property';
import {readOnly, propertiesConfig} from '../configs/reactor';
import ResourceStore from '../stores/ResourceStore';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';

class Resource extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let self = this;
        let selectedConfig;
        //first check if there is a specific config for the property on the selected graphName
        selectedConfig = propertiesConfig[self.props.ResourceStore.graphName];
        //if no specific config is found, get the generic config
        if(!selectedConfig){
            selectedConfig = propertiesConfig.generic;
        }
        //create a list of properties
        let list = this.props.ResourceStore.properties.map(function(node, index) {
            //if there was no config at all or it is hidden, do not render the property
            if(!selectedConfig.config[node.propertyURI] || !selectedConfig.config[node.propertyURI].isHidden){
                //for readOnly, we first check the defautl value then we check readOnly value of each property if exists
                return (
                    <Property key={index} spec={node} readOnly={readOnly? true : (selectedConfig.config[node.propertyURI]? (selectedConfig.config[node.propertyURI].readOnly? true: false) : false)} config={selectedConfig.config[node.propertyURI]} graphName={self.props.ResourceStore.graphName} resource={self.props.ResourceStore.resourceURI}/>
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
                    <NavLink key={index} routeName="resource" href={'/dataset/'+ encodeURIComponent(self.props.ResourceStore.graphName) + '/resource/' + encodeURIComponent(self.props.ResourceStore.resourceURI) + '/' + node}>
                      <div className={(node === currentCategory? 'item link active': 'item link')}> {node} </div>
                    </NavLink>
                );
            });
            tabsContentDIV = selectedConfig.categories.map(function(node, index) {
                return (
                    <div key={index} className={(node === currentCategory? 'ui bottom attached tab segment active': 'ui bottom attached tab segment')}>
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
                    <h2> {this.props.ResourceStore.resourceURI}</h2>
                    {mainDIV}
                </div>
            </div>
        );
    }
}
Resource = connectToStores(Resource, [ResourceStore], function (stores, props) {
    return {
        ResourceStore: stores.ResourceStore.getState()
    };
});
export default Resource;
