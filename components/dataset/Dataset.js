import React from 'react';
import ResourceList from './ResourceList';
import ResourceListPager from './ResourceListPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';
import URIUtil from '../utils/URIUtil';
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
    addCommas(n){
        let rx = /(\d+)(\d{3})/;
        return String(n).replace(/^\d+/, function(w){
            while(rx.test(w)){
                w = w.replace(rx, '$1,$2');
            }
            return w;
        });
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
        let resourceFocusType = this.props.config.resourceFocusType;
        let typeSt, typesLink = [];
        if(resourceFocusType){
            if(!resourceFocusType.length || (resourceFocusType.length && !resourceFocusType[0]) ){
                typeSt = <span className="ui black label"> Everything </span>;
            }else{
                resourceFocusType.forEach(function(uri) {
                    typesLink.push(<a key={uri} className="ui black label" target="_blank" href={uri}> {URIUtil.getURILabel(uri)} </a>);
                });
                typeSt = typesLink;
            }
        }
        let constraintSt, constraints = [];
        let dcnf = this.props.config;
        if(dcnf.constraint){
            for (let prop in dcnf.constraint){
                constraints.push(URIUtil.getURILabel(prop) + ': ' + dcnf.constraint[prop].join(','));
            }
            constraintSt = constraints.join(' && ');
        }
        let datasetTitle;
        if(this.props.datasetURI){
            datasetTitle = <a href={this.props.datasetURI}> {this.props.datasetURI} </a>;
            if(this.props.config && this.props.config.datasetLabel){
                datasetTitle = <a href={this.props.datasetURI}> {this.props.config.datasetLabel} </a>;
            }
        }
        let createResourceDIV = '';
        if(this.props.config && !this.props.readOnly && this.props.config.allowResourceNew){
            createResourceDIV = <div className="ui list">
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
                        <h3 className="ui header">
                            {this.props.total ? <a target="_blank" href={'/export/NTriples/' + encodeURIComponent(this.props.datasetURI)}><span className="ui big blue circular label">{this.state.searchMode ? this.addCommas(this.props.resources.length) + '/' :''}{this.addCommas(this.props.total)}</span></a> : ''} Resources of type {typeSt} in {datasetTitle ? datasetTitle : ' all local datasets'} {dcnf.constraint ? <a title={constraintSt}><i className="ui orange filter icon"></i></a>: ''}
                        </h3>
                        <div className="ui segments">
                            <div className="ui segment">
                                <ResourceList enableAuthentication={this.props.enableAuthentication} resources={this.props.resources} datasetURI={this.props.datasetURI} isBig={true} config={this.props.config} onCloneResource={this.props.onCloneResource}/>
                            </div>
                            <div className="ui secondary segment">
                                <ResourceListPager onSearchMode={this.handleSearchMode.bind(this)} datasetURI={this.props.datasetURI} visibleResourcesTotal={this.props.resources.length} total={this.props.total} threshold={10} currentPage={this.props.page} maxNumberOfResourcesOnPage={this.props.config.maxNumberOfResourcesOnPage}/>
                            </div>
                            {this.props.config && this.props.config.displayQueries ?
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
