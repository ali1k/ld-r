import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {navigateAction, NavLink} from 'fluxible-router';
import {connectToStores} from 'fluxible-addons-react';
import SearchInput, {createFilter} from 'react-search-input'
import {enableAuthentication, defaultDatasetURI, enableAddingNewDatasets, enableDatasetAnnotation, enableQuerySaveImport} from '../configs/general';
import {checkViewAccess, checkEditAccess} from '../services/utils/accessManagement';
import DatasetsStore from '../stores/DatasetsStore';
import URIUtil from './utils/URIUtil';

class Datasets extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            searchTerm: ''
        }
        this.searchUpdated = this.searchUpdated.bind(this)
    }
    componentDidMount() {

    }
    searchUpdated (term) {
        this.setState({searchTerm: term})
    }
    prepareFocusList(list) {
        let out = [];
        list.forEach(function(f, i){
            out.push(<a key={i} href={f} target="_blank">{URIUtil.getURILabel(f)} </a>);
        });
        return out;
    }
    handleCreateDataset() {
        this.context.executeAction(navigateAction, {
            url: '/newDataset'
        });
    }
    displayResource(){
        let resourceURI = ReactDOM.findDOMNode(this.refs.resourceURI).value;
        let datasetURI = ReactDOM.findDOMNode(this.refs.datasetURI).value.trim();
        let output = '/dataset/' + encodeURIComponent(datasetURI) + '/resource/' + encodeURIComponent(resourceURI);
        if(resourceURI){
            this.context.executeAction(navigateAction, {
                url: output
            });
        }
    }
    render() {
        let self = this;
        let optionsList, output ='', outputDSS;
        let color = 'black';
        let user = this.context.getUser();
        let createDatasetDIV = '';
        let annotateDatasetDIV = '';
        let datasetActionsDIV = '';
        let queryImportDIV = '';
        let info = <div className="ui blue message">
                        The list contains only the datasets for which at least one <b>config scope</b> is found!
        </div>;
        let dss = this.props.DatasetsStore.datasetsList;
        if(enableAuthentication && !user){
            output = <div className="ui warning message"><div className="header"> Please <a href="/register">Register</a> or <a href="/login">Login</a> to see the datasets.</div></div>;
        }else{
            if(enableAddingNewDatasets){
                createDatasetDIV = <div className="item">
                    <div  className="medium ui basic icon labeled button" onClick={this.handleCreateDataset.bind(this)}>
                        <i className="cubes large blue icon "></i> <i className="add black icon"></i>Add a New Dataset
                    </div>
                </div>;
            }
            if(enableDatasetAnnotation){
                annotateDatasetDIV = <div className="item">
                    <a  className="medium ui basic icon labeled button" href="/annotateDataset">
                        <i className="cubes large blue icon "></i> <i className="hashtag black icon"></i>Annotate a Dataset
                    </a>
                </div>;
            }
            if(enableQuerySaveImport){
                queryImportDIV = <div className="item">
                    <NavLink  className="medium ui basic icon labeled button" href="/wysiwyq">
                        <i className="large blue level down icon"></i>Import a Query
                    </NavLink>
                </div>;
            }
            datasetActionsDIV = <div className="ui horizontal divided list">
                {createDatasetDIV} {annotateDatasetDIV} {queryImportDIV}
                <br/>
            </div>;
            if(!dss.length){
                if(defaultDatasetURI[0]){
                    output = <div className="ui item" key={defaultDatasetURI[0]}> <div className="content"> <i className="ui blue icon cubes"></i> <a href={'/dataset/1/' + encodeURIComponent(defaultDatasetURI[0])} title="go to resource list">{defaultDatasetURI[0]}</a> <i className="ui green flag icon" title="default dataset"></i> </div> </div>;
                }else{
                    //no graph name is specified
                    output = <div className="ui big item" key="empty" > <div className="content">  Your config is empty!<a href={'/dataset/'}> <span className="ui big blue label">See all resources in all local datasets</span></a></div> </div>;
                }
            }else{
                let tmpOption = '';
                optionsList = dss.filter(function(option, index) {
                    //filter out datasets if no access is provided
                    tmpOption = '1';
                    if(enableAuthentication && option.features.hasLimitedAccess && parseInt(option.features.hasLimitedAccess)){
                        //need to handle access to the dataset
                        //if user is the editor by default he already has view access
                        let editAccess = checkEditAccess(user, option.d, 0, 0, 0);
                        if(!editAccess.access || editAccess.type === 'partial'){
                            let viewAccess = checkViewAccess(user, option.d, 0, 0, 0);
                            if(!viewAccess.access){
                                tmpOption = '';
                            }
                        }
                    }
                    if(tmpOption){
                        return true;
                    }else{
                        return false;
                    }
                }).map(function(option, index) {
                    return <option key={index} value={(option.d)}> {(option.d && option.features.datasetLabel) ? option.features.datasetLabel : option.d} </option>;
                });
                //allow search in datasets list
                const KEYS_TO_FILTERS = ['features.datasetLabel', 'features.resourceFocusType', 'd'];
                dss = dss.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));

                let dsLink = '';
                let dsIcon = '';
                outputDSS = dss.map(function(ds, index) {
                    dsLink = <a href={'/dataset/1/' + encodeURIComponent(ds.d)} title="go to resource list">{ds.features && ds.features.datasetLabel ? ds.features.datasetLabel : ds.d}</a>;
                    if(ds.features && ds.features.isBrowsable){
                        dsLink = <a href={'/browse/' + encodeURIComponent(ds.d)} title="browse data">{ds.features && ds.features.datasetLabel ? ds.features.datasetLabel : ds.d}</a>;
                    }
                    dsIcon = ' cubes ';
                    //remove links if no access is provided
                    if(enableAuthentication && ds.features.hasLimitedAccess && parseInt(ds.features.hasLimitedAccess)){
                        dsIcon = ' unlock '
                        //need to handle access to the dataset
                        //if user is the editor by default he already has view access
                        let editAccess = checkEditAccess(user, ds.d, 0, 0, 0);
                        if(!editAccess.access || editAccess.type === 'partial'){
                            let viewAccess = checkViewAccess(user, ds.d, 0, 0, 0);
                            if(!viewAccess.access){
                                dsLink = <span>{ds.features && ds.features.datasetLabel ? ds.features.datasetLabel : ds.d}</span>;
                                dsIcon = ' lock '
                            }
                        }
                    }
                    if(ds.features){
                        if(typeof ds.features.readOnly === 'undefined' ){
                            color = 'black';
                        }else{
                            if(ds.features.readOnly){
                                color = 'black';
                            }else{
                                color = 'blue';
                            }
                        }
                    }
                    return <div className="ui item" key={ds.d}> <div className="content"> <i className={'ui icon ' + dsIcon + color}></i> {dsLink} {ds.features && ds.features.resourceFocusType ? <span className="ui small circular label"> {self.prepareFocusList(ds.features.resourceFocusType)} </span> : ''}
                        {ds.features && ds.features.metadata ? <a className="ui basic grey label rounded" href={ds.features.metadata} title="metadata" target="_blank"><i className="info icon"></i>metadata</a> : ''}
                        {/*ds.features && ds.features.isStaticDynamic ? <i className="ui brown theme icon" title="loaded from both static and dynamic config"></i> :''*/}
                        {/*ds.features && ds.features.isDynamic && !ds.features.isStaticDynamic ? <i className="ui orange theme icon" title="loaded from dynamic config"></i> :''*/}
                        {ds.features && ds.features.isDefaultDataset ? <i className="ui teal flag icon" title="default dataset"></i> :''}</div> </div>;
                });
            }

        }
        return (
            <div className="ui fluid container ldr-padding-more" ref="datasets">
                <div className="ui grid">
                    <div className="ui column">
                        {dss.length ? <div>{info}</div> : null}
                        <div className="ui segment">
                            <h2><span className="ui big black circular label">{dss.length}</span> Datasets</h2>
                            {this.props.DatasetsStore.datasetsList.length > 7 ?
                                <div className="ui">
                                    <div className="ui form fluid category search">
                                        <div className="ui large icon input">
                                            <SearchInput className="prompt circular ui fluid category search" onChange={this.searchUpdated} placeholder="Search in datasets..." style={{width: 400}} />
                                            <i className="search icon"></i>
                                        </div>
                                    </div>
                                </div>
                                : null}
                            <div className="ui big divided list">
                                {output}{outputDSS}
                            </div>
                        </div>
                        <div className= "ui bottom attached">
                            {datasetActionsDIV}
                        </div>
                        {dss.length ?
                            <div className="ui grey message form">
                                <select ref="datasetURI" className="ui search dropdown">
                                    {optionsList}
                                </select>
                                <input ref="resourceURI" type="text" className="input" placeholder="Enter the URI of the resource e.g. http://dbpedia.org/resource/VU_University_Amsterdam"/>
                                <button className="fluid ui primary button" onClick={this.displayResource.bind(this)}>Display resource in the selected dataset</button>
                            </div>
                            : ''}
                    </div>
                </div>
            </div>
        );
    }
}
Datasets.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
Datasets = connectToStores(Datasets, [DatasetsStore], function (context, props) {
    return {
        DatasetsStore: context.getStore(DatasetsStore).getState()
    };
});
export default Datasets;
