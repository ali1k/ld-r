import React from 'react';
import ReactDOM from 'react-dom';
import {navigateAction} from 'fluxible-router';
import {connectToStores} from 'fluxible-addons-react';
import {enableAuthentication} from '../configs/general';
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
    displayResource(){
        let resourceURI = ReactDOM.findDOMNode(this.refs.resourceURI).value;
        let datasetURI = ReactDOM.findDOMNode(this.refs.datasetURI).value;
        let output = '/dataset/' + encodeURIComponent(datasetURI) + '/resource/' + encodeURIComponent(resourceURI);
        if(resourceURI){
            this.context.executeAction(navigateAction, {
                url: output
            });
        }
    }
    render() {
        let self = this;
        let optionsList, output;
        let color = 'black';
        let user = this.context.getUser();
        let info = <div className="ui blue message">
                        The list contains only the datasets for which at least one <b>config scope</b> is found!
                   </div>;
        let dss = this.props.DatasetsStore.datasetsList;
        if(enableAuthentication && !user){
            output.push(<div className="ui warning message"><div className="header"> Please <a href="/register">Register</a> or <a href="/login">Login</a> to see the datasets.</div></div>);
        }else{
            optionsList = dss.map(function(option, index) {
                return <option key={index} value={(option.d)}> {(option.d && option.features.datasetLabel) ? option.features.datasetLabel : option.d} </option>;
            });
            output = dss.map(function(ds, index) {
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
                return <div className="ui item" key={ds.d}> <div className="content"> <i className={'ui icon cubes ' + color}></i> <a href={'/dataset/1/' + encodeURIComponent(ds.d)} title="go to resource list">{ds.features && ds.features.datasetLabel ? ds.features.datasetLabel : ds.d}</a> {ds.features && ds.features.resourceFocusType ? <span className="ui small circular label"> {self.prepareFocusList(ds.features.resourceFocusType)} </span> : ''} {ds.features && ds.features.isBrowsable ? <a className="ui grey label" href={'/browse/' + encodeURIComponent(ds.d)} title="browse"><i className="zoom icon"></i>browse</a> : ''} {ds.features && ds.features.isDynamic ? <i className="ui orange theme icon" title="loaded from dynamic config"></i> :''} {ds.features && ds.features.isDefaultDataset ? <i className="ui teal flag icon" title="default dataset"></i> :''}</div> </div>;
            });

        }

        return (
            <div className="ui page grid" ref="datasets">
                <div className="ui column">
                    {dss.length ? <div>{info}</div> : ''}
                    <div className="ui segment">
                        <h2><span className="ui big black circular label">{dss.length}</span> Datasets</h2>
                        <div className="ui big divided list">
                            {output}
                        </div>
                    </div>
                    {dss.length ?
                    <div className="ui violet message form">
                        <select ref="datasetURI" className="ui search dropdown">
                            {optionsList}
                        </select>
                        <input ref="resourceURI" type="text" className="input" placeholder="Enter the URI of the resource e.g. http://dbpedia.org/resource/VU_University_Amsterdam"/>
                        <button className="fluid ui grey button" onClick={this.displayResource.bind(this)}>Display the specified resource</button>
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
