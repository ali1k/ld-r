import React from 'react';
import DatasetStore from '../stores/DatasetStore';
import {enableAuthentication, maxNumberOfResourcesOnPage, resourceFocusType} from '../configs/reactor';
import {connectToStores} from 'fluxible/addons';
import {NavLink} from 'fluxible-router';
import getResourcesCount from '../actions/getResourcesCount';
import ResourceList from './ResourceList';

class Dataset extends React.Component {
    componentDidMount() {
        this.context.executeAction(getResourcesCount, {id: this.props.DatasetStore.graphName});
    }
    render() {
        let self = this;
        let graphName = this.props.DatasetStore.graphName;
        let i, startI, totalPages, threshold = 10, currentPage, pageList = [];
        let firstPage, lastPage;
        if(this.props.DatasetStore.total){
            currentPage = parseInt(this.props.DatasetStore.page);
            //total number of pages
            totalPages = Math.ceil(this.props.DatasetStore.total / maxNumberOfResourcesOnPage);
            if(totalPages > threshold){
                firstPage = <NavLink routeName="dataset" className="ui purple label" href={'/dataset/1/' + encodeURIComponent(this.props.DatasetStore.graphName)}><i className="step backward icon"></i></NavLink>;
                lastPage = <NavLink routeName="dataset" className="ui purple label" href={'/dataset/' + totalPages + '/' + encodeURIComponent(this.props.DatasetStore.graphName)}><i className="step forward icon"></i></NavLink>;
                if(currentPage - Math.round(threshold / 2) <= 0){
                    startI = 1;
                }else{
                    startI = currentPage - Math.round(threshold / 2);
                }
                for (i = startI; (i <= (currentPage + threshold) && i <= totalPages); i++) {
                    if(i === currentPage){
                        pageList.push(<NavLink key={i} routeName="dataset" className="ui label blue" href={'/dataset/' + i + '/' + encodeURIComponent(this.props.DatasetStore.graphName)}> {i} </NavLink>);
                    }else{
                        pageList.push(<NavLink key={i} routeName="dataset" className="ui basic label" href={'/dataset/' + i + '/' + encodeURIComponent(this.props.DatasetStore.graphName)}> {i} </NavLink>);
                    }
                }
            }else{
                for (i = 1; i <= totalPages; i++) {
                    if(i === currentPage){
                        pageList.push(<NavLink key={i} routeName="dataset" className="ui label blue" href={'/dataset/' + i + '/' + encodeURIComponent(this.props.DatasetStore.graphName)}> {i} </NavLink>);
                    }else{
                        pageList.push(<NavLink key={i} routeName="dataset" className="ui basic label" href={'/dataset/' + i + '/' + encodeURIComponent(this.props.DatasetStore.graphName)}> {i} </NavLink>);
                    }
                }
            }
        }
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
                        <h3>{this.props.DatasetStore.total ? <span className="ui big black circular label">{this.props.DatasetStore.total}</span> : ''} Resources of type {typeSt}</h3>
                        <ResourceList resources={this.props.DatasetStore.resources} graphName={graphName} isBig={true} />
                    </div>
                    <div className= "ui secondary segment bottom attached">
                        {totalPages} Page(s): {firstPage} {pageList} {lastPage}
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
