import React from 'react';
import Property from './Property';
import {readOnly, usePropertyCategories, propertyCategories, propertiesConfig} from '../configs/reactor';
import ResourceStore from '../stores/ResourceStore';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';

class Resource extends React.Component {
    render() {
        const self = this;
        let list = this.props.ResourceStore.properties.map(function(node, index) {
            return (
                <Property key={index} spec={node} readOnly={readOnly} config={propertiesConfig[node.propertyURI]}/>
            );
        });
        let mainDIV, tabsDIV, tabsContentDIV;
        //categorize properties in different tabs
        if(usePropertyCategories){
            tabsDIV = propertyCategories.map(function(node, index) {
                return (
                    <NavLink key={index} routeName="resource" href={'/dataset/'+ encodeURIComponent(self.props.ResourceStore.graphName) + '/resource/' + encodeURIComponent(self.props.ResourceStore.resourceURI) + '/' + node}>
                      <div className={(node === self.props.ResourceStore.currentCategory? 'item link active': 'item link')}> {node} </div>
                    </NavLink>
                );
            });
            tabsContentDIV = propertyCategories.map(function(node, index) {
                return (
                    <div key={index} className={(node === self.props.ResourceStore.currentCategory? 'ui bottom attached tab segment active': 'ui bottom attached tab segment')}>
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
