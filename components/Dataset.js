import React from 'react';
import DatasetStore from '../stores/DatasetStore';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';

class Dataset extends React.Component {
    render() {
        let graphName = this.props.DatasetStore.graphName;
        let list;
        if(!this.props.DatasetStore.resources.length){
            list = <div className="ui warning message"><div className="header"> There was no resource in the selected dataset! Either add resources to your dataset or go to another dataset which has resources...</div></div>;
        }else{
            list = this.props.DatasetStore.resources.map((node, index) => {
                return (
                    <div className="item active" key={index}>
                        <NavLink routeName="resource" className="ui label" href={'/dataset/'+ encodeURIComponent(node.g) +'/resource/' + encodeURIComponent(node.v)} >
                            {node.v}
                        </NavLink>
                    </div>
                );
            });
        }
        return (
            <div className="ui page grid" ref="dataset">
                <div className="ui column">
                    <div className="ui segment">
                        <h3> Resources of type "{this.props.DatasetStore.resourceFocusType? this.props.DatasetStore.resourceFocusType.join(): 'everything!'}"</h3>
                        <div className="ui divided link list">
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
