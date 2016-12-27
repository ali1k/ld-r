import React from 'react';
import ReactDOM from 'react-dom';
import {navigateAction} from 'fluxible-router';
import {connectToStores} from 'fluxible-addons-react';
import {enableAuthentication, defaultDatasetURI, enableAddingNewDatasets, enableDatasetAnnotation} from '../configs/general';
import DatasetsStore from '../stores/DatasetsStore';
import URIUtil from './utils/URIUtil';

class Datasets extends React.Component {
    componentDidMount() {

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
    compareProps(a,b) {
        if(a.features && b.features){
            if (parseFloat(a.features.position) < parseFloat(b.features.position))
                return -1;
            if (parseFloat(a.features.position) > parseFloat(b.features.position))
                return 1;
            //sort by alphabets
            if(a.features.datasetLabel < b.features.datasetLabel){
                return -1;
            }
            if(a.features.datasetLabel > b.features.datasetLabel){
                return 1;
            }
        }
        return 0;
    }
    render() {
        let self = this;
        let optionsList, output ='', outputDSS;
        let color = 'black';
        let user = this.context.getUser();
        let createDatasetDIV = '';
        let annotateDatasetDIV = '';
        let datasetActionsDIV = '';
        let info = <div className="ui blue message">
                        The list contains only the datasets for which at least one <b>config scope</b> is found!
                   </div>;
        let dss = this.props.DatasetsStore.datasetsList;
        //sort by position
        dss.sort(self.compareProps);
        if(enableAuthentication && !user){
            output = <div className="ui warning message"><div className="header"> Please <a href="/register">Register</a> or <a href="/login">Login</a> to see the datasets.</div></div>;
        }else{
            if(enableAddingNewDatasets){
                createDatasetDIV = <div className="item">
                        <div  className="medium ui basic icon labeled button" onClick={this.handleCreateDataset.bind(this)}>
                            <i className="cubes square large blue icon "></i> <i className="add black icon"></i>Add a New Dataset
                        </div>
                 </div>;
            }
            if(enableDatasetAnnotation){
                annotateDatasetDIV = <div className="item">
                        <a  className="medium ui basic icon labeled button" href="/annotateDataset">
                            <i className="cubes square large blue icon "></i> <i className="hashtag black icon"></i>Annotate a Dataset
                        </a>
                </div>;
            }
            datasetActionsDIV = <div className="ui horizontal divided list">
                {createDatasetDIV} {annotateDatasetDIV}
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
                optionsList = dss.map(function(option, index) {
                    return <option key={index} value={(option.d)}> {(option.d && option.features.datasetLabel) ? option.features.datasetLabel : option.d} </option>;
                });
                outputDSS = dss.map(function(ds, index) {
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
                    return <div className="ui item" key={ds.d}> <div className="content"> <i className={'ui icon cubes ' + color}></i> <a href={'/dataset/1/' + encodeURIComponent(ds.d)} title="go to resource list">{ds.features && ds.features.datasetLabel ? ds.features.datasetLabel : ds.d}</a> {ds.features && ds.features.resourceFocusType ? <span className="ui small circular label"> {self.prepareFocusList(ds.features.resourceFocusType)} </span> : ''}
                    {ds.features && ds.features.isBrowsable ? <a className="ui grey label" href={'/browse/' + encodeURIComponent(ds.d)} title="browse"><i className="zoom icon"></i>browse</a> : ''}
                    {ds.features && ds.features.isStaticDynamic ? <i className="ui brown theme icon" title="loaded from both static and dynamic config"></i> :''}
                    {ds.features && ds.features.isDynamic && !ds.features.isStaticDynamic ? <i className="ui orange theme icon" title="loaded from dynamic config"></i> :''}
                    {ds.features && ds.features.isDefaultDataset ? <i className="ui teal flag icon" title="default dataset"></i> :''}</div> </div>;
                });
            }

        }
        return (
            <div className="ui page grid" ref="datasets">
                <div className="ui column">
                    {dss.length ? <div>{info}</div> : ''}
                    <div className="ui segment">
                        <h2><span className="ui big black circular label">{dss.length}</span> Datasets</h2>
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
        );
    }
}
Datasets.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
Datasets = connectToStores(Datasets, [DatasetsStore], function (context, props) {
    return {
        DatasetsStore: context.getStore(DatasetsStore).getState()
    };
});
export default Datasets;
