import React from 'react';
import DatasetHeader from './DatasetHeader';
import DatasetViewer from './DatasetViewer';
import DatasetPager from './DatasetPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';
import {enableAuthentication} from '../../configs/general';

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
            }else{
                out = 0;
            }
        }
        return out;
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
        let dcnf = this.state.config;

        return (
            <div className="ui" ref="datasetFB">
                <DatasetHeader config={dcnf} total={this.props.total}  datasetURI={this.props.datasetURI} searchMode={this.state.searchMode} resourcesLength={this.props.resourcesLength}/>
                <div className="ui segments">
                    <div className="ui segment">
                        <DatasetViewer enableAuthentication={enableAuthentication} cloneable={0} resources={this.props.resources} datasetURI={this.props.datasetURI} OpenInNewTab={true} isBig={this.props.isBig} config={dcnf}/>
                    </div>
                    <DatasetPager config={dcnf} onSearchMode={this.handleSearchMode.bind(this)} selection={this.props.selection} onExpandCollapse={this.props.onExpandCollapse} handleClick={this.props.handleClick} datasetURI={this.props.datasetURI} total={this.props.total} threshold={this.props.pagerSize} currentPage={this.props.currentPage} noOfAnalysisProps={this.getNoOfPropsForAnalysis()} handleViewerChange={this.handleViewerChange.bind(this)}/>
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
