import React from 'react';
import DatasetHeader from './DatasetHeader';
import DatasetViewer from './DatasetViewer';
import DatasetPager from './DatasetPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';

class Dataset extends React.Component {
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
                                <DatasetViewer enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={true} config={dcnf} cloneable={1} onCloneResource={this.props.onCloneResource}/>
                            </div>
                            <div className="ui secondary segment">
                                <DatasetPager onSearchMode={this.handleSearchMode.bind(this)} datasetURI={this.props.datasetURI} visibleResourcesTotal={this.props.resources.length} total={this.props.total} threshold={10} currentPage={this.props.page} maxNumberOfResourcesOnPage={dcnf.maxNumberOfResourcesOnPage}/>
                            </div>
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
