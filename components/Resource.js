import React from 'react';
import Property from './Property';
import {propertiesConfig} from '../configs/reactor';
import ResourceStore from '../stores/ResourceStore';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';

class Resource extends React.Component {
    render() {
        let list = this.props.ResourceStore.properties.map(function(node, index) {
            return (
                <Property key={index} spec={node} config={propertiesConfig[node.propertyURI]}/>
            );
        });
        return (
            <div className="ui page grid" ref="resource">
                <div className="ui column">
                    <div className="ui segment">
                        <h3 className="ui big label"> {this.props.ResourceStore.resourceURI}</h3>
                        <div className="ui grid">
                            <div className="column ui list">
                                {list}
                            </div>
                        </div>
                    </div>
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
