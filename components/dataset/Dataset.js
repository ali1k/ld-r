import React from 'react';
import DatasetHeader from './DatasetHeader';
import DatasetViewer from './DatasetViewer';
import DatasetPager from './DatasetPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';
import {enableAuthentication} from '../../configs/general';
import json2csv from 'json2csv';

class Dataset extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchMode: 0, showAllResources: 0, config: this.props.config ? JSON.parse(JSON.stringify(this.props.config)) : ''};
    }
    handleSearchMode(searchMode) {
        this.setState({searchMode: searchMode});
    }
    toggleShowAllResources() {
        this.setState({showAllResources: !this.state.showAllResources});
    }
    handleExport(){
        let fields = this.getPropsForAnalysis();
        let csv = json2csv({ data: this.props.resources, fields: fields });
        //console.log(csv);
        let uriContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        window.open(uriContent, 'data.csv');
    }
    getPropsForAnalysis() {
        let out = [];
        let r = this.props.resources;
        if(r.length){
            out.push('v');//uri
            if(r[0].title){
                out.push('title')
            }else if(r[0].label){
                out.push('label')
            }
            if(r[0].propsForAnalysis){
                for(let prop in r[0].propsForAnalysis){
                    out.push('propsForAnalysis.'+prop);
                }
                return out;
            }
        }
        return out;
    }
    handleViewerChange(viewer) {
        let tmp = this.state.config;
        tmp.datasetViewer = [viewer];
        this.setState({config: tmp});
    }
    componentDidMount() {
    }
    render() {
        //check erros first
        if(this.props.error){
            return (
                <div className="ui fluid container ldr-padding-more" ref="dataset">
                    <div className="ui grid">
                        <div className="ui column">
                            <div className="ui warning message"><h2>{this.props.error}</h2></div>
                        </div>
                    </div>
                </div>
            )
        }
        //continue
        let self = this;
        let createResourceDIV = '';
        let dcnf = this.props.config;
        if(dcnf && !this.props.readOnly && dcnf.allowResourceNew){
            createResourceDIV =
            <div className="ui list">
                <div className="item">
                    <div  className="medium ui basic icon labeled button" onClick={this.props.onCreateResource.bind(this, this.props.datasetURI)}>
                        <i className="cube square large blue icon "></i> <i className="add black icon"></i> Add a New Resource
                    </div>
                </div>
                <br/>
            </div>;
        }
        return (
            <div className="ui fluid container ldr-padding-more" ref="dataset">
                <div className="ui grid">
                    <div className="ui column">
                        <DatasetHeader config={dcnf} total ={this.props.total} datasetURI={this.props.datasetURI} searchMode={this.state.searchMode} resourcesLength={this.props.resources.length}/>
                        <div className="ui segments">
                            <div className="ui segment">
                                <DatasetViewer enableAuthentication={enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={true} config={dcnf} cloneable={1} onCloneResource={this.props.onCloneResource}/>
                            </div>
                            <DatasetPager config={dcnf} showAllResources={this.state.showAllResources} onShowAllResources={this.toggleShowAllResources.bind(this)} onSearchMode={this.handleSearchMode.bind(this)} datasetURI={this.props.datasetURI} visibleResourcesTotal={this.props.resources.length} total={this.props.total} threshold={10} currentPage={this.props.page}  handleViewerChange={this.handleViewerChange.bind(this)} handleExport={this.handleExport.bind(this)}/>
                            {dcnf && dcnf.displayQueries ?
                                <div className= "ui tertiary segment">
                                    <YASQEViewer spec={{value: this.props.resourceQuery}} />
                                </div>
                                : ''}
                        </div>
                        <div className= "ui bottom attached">
                            {createResourceDIV}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Dataset;
