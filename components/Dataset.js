import React from 'react';
import DatasetStore from '../stores/DatasetStore';
import {connectToStores} from 'fluxible-addons-react';
import {NavLink} from 'fluxible-router';
import getResourcesCount from '../actions/getResourcesCount';
import ResourceList from './ResourceList';
import ResourceListPager from './ResourceListPager';

class Dataset extends React.Component {
    componentDidMount() {
        this.context.executeAction(getResourcesCount, {id: this.props.DatasetStore.graphName});
    }
    getPropertyLabel(uri) {
        let property = '';
        let tmp = uri;
        let tmp2 = tmp.split('#');
        if(tmp2.length > 1){
            property = tmp2[1];
        }else{
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
        }
        return property;
    }
    addCommas(n){
        let rx = /(\d+)(\d{3})/;
        return String(n).replace(/^\d+/, function(w){
            while(rx.test(w)){
                w = w.replace(rx, '$1,$2');
            }
            return w;
        });
    }
    render() {
        let self = this;
        let graphName = this.props.DatasetStore.graphName;
        let resourceFocusType = this.props.DatasetStore.resourceFocusType;
        let typeSt, typesLink = [];
        if(resourceFocusType){
            if(!resourceFocusType.length || (resourceFocusType.length && !resourceFocusType[0]) ){
                typeSt = <span className="ui black label"> Everything </span>;
            }else{
                resourceFocusType.forEach(function(uri) {
                    typesLink.push(<a key={uri} className="ui black label" target="_blank" href={uri}> {self.getPropertyLabel(uri)} </a>);
                });
                typeSt = typesLink;
            }
        }
        return (
            <div className="ui page grid" ref="dataset">
                <div className="ui column">
                    <div className="ui segment top attached">
                        <h3>{this.props.DatasetStore.total ? <span className="ui big black circular label">{this.addCommas(this.props.DatasetStore.total)}</span> : ''} Resources of type {typeSt} in {graphName ? <a href={graphName}>{graphName}</a> : ' all local datasets'}</h3>
                        <ResourceList resources={this.props.DatasetStore.resources} graphName={graphName} isBig={true} />
                    </div>
                    <div className= "ui secondary segment bottom attached">
                        <ResourceListPager graphName={graphName} total={this.props.DatasetStore.total} threshold={10} currentPage={this.props.DatasetStore.page}/>
                    </div>
                </div>
            </div>
        );
    }
}
Dataset.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
Dataset = connectToStores(Dataset, [DatasetStore], function (context, props) {
    return {
        DatasetStore: context.getStore(DatasetStore).getState()
    };
});
export default Dataset;
