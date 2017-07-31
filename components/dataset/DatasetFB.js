import React from 'react';
import DatasetHeader from './DatasetHeader';
import DatasetViewer from './DatasetViewer';
import DatasetPager from './DatasetPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';
import {enableAuthentication} from '../../configs/general';

class DatasetFB extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchMode: 0};
    }
    handleSearchMode(searchMode) {
        this.setState({searchMode: searchMode});
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
        let dcnf = this.props.config;

        return (
            <div className="ui" ref="datasetFB">
                <DatasetHeader config={dcnf} total={this.props.total}  datasetURI={this.props.datasetURI} searchMode={this.state.searchMode} resourcesLength={this.props.resourcesLength}/>
                <div className="ui segments">
                    <div className="ui segment">
                        <DatasetViewer enableAuthentication={enableAuthentication} cloneable={0} resources={this.props.resources} datasetURI={this.props.datasetURI} OpenInNewTab={true} isBig={this.props.isBig} config={dcnf}/>
                    </div>
                    <div className= "ui secondary segment ">
                        <DatasetPager config={dcnf} onSearchMode={this.handleSearchMode.bind(this)} selection={this.props.selection} onExpandCollapse={this.props.onExpandCollapse} handleClick={this.props.handleClick} datasetURI={this.props.datasetURI} total={this.props.total} threshold={this.props.pagerSize} currentPage={this.props.currentPage} maxNumberOfResourcesOnPage={dcnf.maxNumberOfResourcesOnPage}/>
                    </div>
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
