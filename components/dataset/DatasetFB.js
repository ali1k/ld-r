import React from 'react';
import DatasetHeader from './DatasetHeader';
import DatasetViewer from './DatasetViewer';
import DatasetPager from './DatasetPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';
import {enableAuthentication, enableQuerySaveImport} from '../../configs/general';
import json2csv from 'json2csv';

class DatasetFB extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchMode: 0, config: this.props.config ? JSON.parse(JSON.stringify(this.props.config)) : ''};
    }
    handleSearchMode(searchMode) {
        this.setState({searchMode: searchMode});
    }
    handleViewerChange(viewer) {
        let tmp = this.state.config;
        tmp.datasetViewer = [viewer];
        this.setState({config: tmp});
    }
    handleToggleShowQuery() {
        let tmp = this.state.config;
        if(!this.state.config){
            tmp ={};
        }
        if(tmp.displayQueries){
            tmp.displayQueries = 0;
        }else{
            tmp.displayQueries = 1;
        }
        this.setState({config: tmp});
    }
    handleExport(){
        let fields = this.getPropsForAnalysis();
        let csv = json2csv({ data: this.props.resources, fields: fields });
        //console.log(csv);
        let uriContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        window.open(uriContent, 'data.csv');
    }
    //it is required for providing different types of visualizations
    getNoOfPropsForAnalysis(){
        let out = 0;
        let r = this.props.resources;
        if(r.length){
            if(r[0].propsForAnalysis){
                for(let prop in r[0].propsForAnalysis){
                    out = out + 1;
                }
                return out;
            }
        }
        return out;
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
    componentDidMount() {
    }
    render() {
        let facetConfigs;
        if(this.props.selection && this.props.selection.options && this.props.selection.options.facetConfigs){
            facetConfigs = this.props.selection.options.facetConfigs;
        }
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
        let dcnf = this.state.config;
        if(Object.keys(this.state.config).length === 0){
            dcnf = this.props.config;
        }
        return (
            <div className="ui" ref="datasetFB">
                <DatasetHeader importedEnvState={this.props.importedEnvState} config={dcnf} total={this.props.total}  datasetURI={this.props.datasetURI} searchMode={this.state.searchMode} resourcesLength={this.props.resourcesLength} hasResources={this.props.resources.length} pivotConstraint={this.props.pivotConstraint} prevEnvState={this.props.prevEnvState} handleBackToPrevPivotState={this.props.handleBackToPrevPivotState}/>
                <div className="ui segments">
                    <div className="ui segment">
                        <DatasetViewer expanded={this.props.expanded} enableAuthentication={enableAuthentication} cloneable={0} resources={this.props.resources} datasetURI={this.props.datasetURI} OpenInNewTab={true} isBig={this.props.isBig} config={dcnf} facetConfigs={facetConfigs} pivotConstraint={this.props.pivotConstraint}/>
                    </div>
                    <DatasetPager hasResources={this.props.resources.length} config={dcnf} enableQuerySaveImport={enableQuerySaveImport} resourceQuery={this.props.resourceQuery} showAllResources={this.props.showAllResources} onShowAllResources={this.props.onShowAllResources} onSearchMode={this.handleSearchMode.bind(this)} selection={this.props.selection} pivotConstraint={this.props.pivotConstraint} onExpandCollapse={this.props.onExpandCollapse} handleClick={this.props.handleClick} datasetURI={this.props.datasetURI} total={this.props.total} threshold={this.props.pagerSize} currentPage={this.props.currentPage} noOfAnalysisProps={this.getNoOfPropsForAnalysis()} handleViewerChange={this.handleViewerChange.bind(this)} handleToggleShowQuery={this.handleToggleShowQuery.bind(this)} handleExport={this.handleExport.bind(this)}/>
                    {dcnf.displayQueries ?
                        <div className= "ui tertiary segment">
                            <YASQEViewer spec={{value: this.props.resourceQuery}} />
                        </div>
                        : ''}
                </div>
            </div>
        );
    }
}
export default DatasetFB;
