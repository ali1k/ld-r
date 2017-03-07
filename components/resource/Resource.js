import React from 'react';
import PropertyReactor from '../reactors/PropertyReactor';
import {NavLink} from 'fluxible-router';
import URIUtil from '../utils/URIUtil';
import cloneResource from '../../actions/cloneResource';

class Resource extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        //scroll to top of the page
        if(this.props.config && this.props.config.readOnly){
            let body = $('html, body');
            body.stop().animate({scrollTop:0}, '500', 'swing', function() {
            });
        }
    }
    handleCloneResource(datasetURI, resourceURI, e) {
        this.context.executeAction(cloneResource, {
            dataset: datasetURI,
            resourceURI: resourceURI
        });
        e.stopPropagation();
    }
    render() {
        //check erros first
        if(this.props.error){
            return (
                <div className="ui page grid" ref="resource">
                    <div className="ui column">
                        <div className="ui warning message"><h2>{this.props.error}</h2></div>
                    </div>
                </div>
            )
        }
        //continue
        let readOnly = 1;
        let createdByDIV, createdOnDIV;
        let isUserTheCreator = 0;
        let user = this.context.getUser();
        let self = this;
        let accessLevel, isWriteable, configReadOnly, creatorDIV, dateDIV, annotationMetaDIV, annotationDIV;
        if(typeof self.props.readOnly !== 'undefined'){
            readOnly = self.props.readOnly;
        }else{
            //check the config for resource
            if(self.props.config && typeof self.props.config.readOnly !== 'undefined'){
                readOnly = self.props.config.readOnly;
            }
        }
        //create a list of properties
        let list = this.props.properties.map(function(node, index) {
            //if there was no config at all or it is hidden, do not render the property
            if(!node.config || !node.config.isHidden){
                //for readOnly, we first check the defautl value then we check readOnly value of each property if exists
                //this is what comes from the config
                if(readOnly){
                    configReadOnly = true;
                }else{
                    if(node.config){
                        if(node.config.readOnly){
                            configReadOnly = true;
                        }else{
                            configReadOnly = false;
                        }
                    }
                }
                if(node.propertyURI === 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdOn'){
                    dateDIV = <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>;
                }else if(node.propertyURI === 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdBy') {
                    creatorDIV = <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>;
                }else if(node.propertyURI === 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#annotatedBy') {
                    annotationMetaDIV = <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>;
                }else if(node.propertyURI === 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#annotations') {
                    annotationDIV = <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>;
                }else{
                    return (
                        <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>
                    );
                }
            }
        });
        let currentCategory, mainDIV, tabsDIV, tabsContentDIV;
        //categorize properties in different tabs
        if(this.props.config.usePropertyCategories){
            currentCategory = this.props.currentCategory;
            if(!currentCategory){
                currentCategory = this.props.config.propertyCategories[0];
            }
            tabsDIV = this.props.config.propertyCategories.map(function(node, index) {
                return (
                    <NavLink className={(node === currentCategory ? 'item link active' : 'item link')} key={index} routeName="resource" href={'/dataset/' + encodeURIComponent(self.props.datasetURI ) + '/resource/' + encodeURIComponent(self.props.resource) + '/' + node + '/' + encodeURIComponent(self.props.propertyPath)}>
                      {node}
                    </NavLink>
                );
            });
            tabsContentDIV = this.props.config.propertyCategories.map(function(node, index) {
                return (
                    <div key={index} className={(node === currentCategory ? 'ui bottom attached tab segment active' : 'ui bottom attached tab segment')}>
                        <div className="ui grid">
                            <div className="column ui list">
                                {(node === currentCategory ? list : '')}
                            </div>
                        </div>
                    </div>
                );
            });
            mainDIV = <div>
                        <div className="ui top attached tabular menu">
                            {tabsDIV}
                        </div>
                        {tabsContentDIV}
                      </div>;
        }else{
            mainDIV = <div className="ui segment">
                            <div className="ui grid">
                                <div className="column ui list">
                                    {list}
                                    {annotationDIV}
                                    {annotationMetaDIV}
                                    {dateDIV}
                                    {creatorDIV}
                                </div>
                            </div>
                      </div>;
        }
        let datasetTitle = this.props.datasetURI;
        if(this.props.config && this.props.config.datasetLabel){
            datasetTitle = this.props.config.datasetLabel;
        }
        let breadcrumb;
        if(self.props.propertyPath.length > 1){
            breadcrumb = <div className="ui large breadcrumb">
                        <a className="section" href={'/dataset/1/' + encodeURIComponent(self.props.datasetURI )}><i className="cubes icon"></i>{datasetTitle}</a>
                        <i className="big right chevron icon divider"></i>
                          <a className="section" href={'/dataset/' + encodeURIComponent(self.props.datasetURI ) + '/resource/' + encodeURIComponent(self.props.propertyPath[0])}><i className="cube icon"></i>{URIUtil.getURILabel(self.props.propertyPath[0])}</a>
                          <i className="big right arrow icon divider"></i>
                          <div className="active section">{URIUtil.getURILabel(self.props.propertyPath[1])}</div>
                        </div>;
        }else{
            breadcrumb = <div className="ui large breadcrumb">
                        <a className="section" href={'/dataset/1/' + encodeURIComponent(self.props.datasetURI )}><i className="cubes icon"></i>{datasetTitle}</a>
                        <i className="big right chevron icon divider"></i>
                        </div>;
        }
        let cloneable = 0;
        if (self.props.config && !this.props.readOnly && typeof self.props.config.allowResourceClone !== 'undefined' && parseInt(self.props.config.allowResourceClone)) {
            cloneable = 1;
        }
        return (
            <div className="ui page grid" ref="resource" itemScope itemType={this.props.resourceType} itemID={this.props.resource}>
                <div className="ui column">
                    {breadcrumb}
                    <h2>
                        <a target="_blank" href={'/export/NTriples/' + encodeURIComponent(this.props.datasetURI) + '/' + encodeURIComponent(this.props.resource)}><i className="blue icon cube"></i></a> <a href={this.props.resource} target="_blank">{this.props.title}</a>&nbsp;&nbsp;
                        {cloneable ?
                            <a className="medium ui circular basic icon button" onClick={this.handleCloneResource.bind(this, this.props.datasetURI, decodeURIComponent(this.props.resource))} title="clone this resource"><i className="icon teal superscript"></i></a>
                        : ''}
                    </h2>
                    {mainDIV}
                </div>
            </div>
        );
    }
}
Resource.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
export default Resource;
