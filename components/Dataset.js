import React from 'react';
import DatasetStore from '../stores/DatasetStore';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';

class Dataset extends React.Component {
    render() {
        let graphName = this.props.DatasetStore.graphName;
        let list = this.props.DatasetStore.resources.map((node, index) => {
            return (
                <NavLink key={index} routeName="resource" className="item active" href={'/dataset/'+ encodeURIComponent(graphName) +'/resource/' + encodeURIComponent(node)} >
                    {node}
                </NavLink>
            );
        });
        return (
            <div className="ui page grid" ref="dataset">
                <div className="ui column">
                    <div className="ui segment">
                        <h3> Resources</h3>
                        <div className="ui divided list">
                            {list}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
Dataset = connectToStores(Dataset, [DatasetStore], function (stores, props) {
    return {
        DatasetStore: stores.DatasetStore.getState()
    };
});
export default Dataset;
