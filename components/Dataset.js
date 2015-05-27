import React from 'react';
import DatasetStore from '../stores/DatasetStore';
import {enableAuthentication, maxNumberOfResourcesOnPage} from '../configs/reactor';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';
import getResourcesCount from '../actions/getResourcesCount';

class Dataset extends React.Component {
    componentDidMount() {
        this.context.executeAction(getResourcesCount, {id: this.props.DatasetStore.graphName});
    }
    includesProperty(list, resource) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource){
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource) {
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
                            if(resource && this.includesProperty(user.editorOfProperty, resource)){
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
    render() {
        let self = this;
        let user = this.context.getUser();
        let graphName = this.props.DatasetStore.graphName;
        let userAccess, title, list, dbClass = 'blue cube icon';
        if(!this.props.DatasetStore.resources.length){
            list = <div className="ui warning message"><div className="header"> There was no resource in the selected dataset! Either add resources to your dataset or go to another dataset which has resources...</div></div>;
        }else{
            list = this.props.DatasetStore.resources.map((node, index) => {
                title = node.title ? node.title : (node.label ? node.label : node.v);
                if(!enableAuthentication) {
                    dbClass = 'green cube icon';
                }else{
                    userAccess = self.checkAccess(user, node.g, node.v);
                    if(userAccess.access){
                        if(userAccess.type === 'full'){
                            dbClass = 'green cube icon';
                        }else{
                            dbClass = 'yellow cube icon';
                        }
                    }else{
                        dbClass = 'blue cube icon';
                    }
                }
                return (
                    <div className="item animated fadeIn" key={index}>
                        <NavLink routeName="resource" className="ui" href={'/dataset/' + encodeURIComponent(node.g) + '/resource/' + encodeURIComponent(node.v)} >
                            <div className="content"> <i className={dbClass}></i> {title} </div>
                        </NavLink>
                    </div>
                );
            });
        }
        let i, tmp, pageList = [];
        if(this.props.DatasetStore.total){
            tmp = Math.ceil(this.props.DatasetStore.total / maxNumberOfResourcesOnPage);
            for (i = 1; i <= tmp; i++) {
                if(i === parseInt(this.props.DatasetStore.page)){
                    pageList.push(<NavLink routeName="dataset" className="ui label blue" href={'/dataset/' + i + '/' + encodeURIComponent(this.props.DatasetStore.graphName)}> {i} </NavLink>);
                }else{
                    pageList.push(<NavLink routeName="dataset" className="ui basic label" href={'/dataset/' + i + '/' + encodeURIComponent(this.props.DatasetStore.graphName)}> {i} </NavLink>);
                }
            }
        }
        return (
            <div className="ui page grid" ref="dataset">
                <div className="ui column">
                    <div className="ui segment top attached">
                        <h3>{this.props.DatasetStore.total ? <span className="ui big black circular label">{this.props.DatasetStore.total}</span> : ''} Resources of type "{this.props.DatasetStore.resourceFocusType ? this.props.DatasetStore.resourceFocusType.join() : 'everything!'}"</h3>
                        <div className="ui big divided animated list">
                            {list}
                        </div>
                    </div>
                    <div className= "ui secondary segment bottom attached">
                        Page: {pageList}
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
Dataset = connectToStores(Dataset, [DatasetStore], function (stores, props) {
    return {
        DatasetStore: stores.DatasetStore.getState()
    };
});
export default Dataset;
