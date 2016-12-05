import React from 'react';
import PropertyReactor from '../reactors/PropertyReactor';
import {NavLink} from 'fluxible-router';
import classNames from 'classnames/bind';
import URIUtil from '../utils/URIUtil';
import cloneResource from '../../actions/cloneResource';

class PersonResource extends React.Component {
    constructor(props) {
        super(props);
        this.state={showDetails: 0};
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
    toggleShowMore(){
        this.setState({showDetails: ! this.state.showDetails});
    }
    render() {
        let picture, birthDate, birthPlace, deathDate, deathPlace, knownFor, aboutP;
        let readOnly = 1;
        let user = this.context.getUser();
        let self = this;
        let accessLevel, isWriteable, configReadOnly;
        if(self.props.readOnly !== 'undefined'){
            readOnly = self.props.readOnly;
        }else{
            //check the config for resource
            if(self.props.config && self.props.config.readOnly !== 'undefined'){
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
                if(node.propertyURI === 'http://xmlns.com/foaf/0.1/depiction'){
                    picture = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/birthDate'){
                    birthDate = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/birthPlace'){
                    birthPlace = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/deathDate'){
                    deathDate = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/deathPlace'){
                    deathPlace = node.instances[0].value;
                }
                if(node.propertyURI === 'http://www.w3.org/2000/01/rdf-schema#comment'){
                    aboutP = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/knownFor'){
                    knownFor = node.instances;
                }
                return (
                    <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>
                );

            }
        });
        if(knownFor){
            let knownForDIV = knownFor.map((node, index)=>{
                return (
                    <a key={index} target="_blank" className="ui tag label" href={node.value}>{URIUtil.getURILabel(node.value)}></a>
                );
            });
        }
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
        let detailClasses = classNames({
            'hide-element': !this.state.showDetails
        });
        return (
            <div className="ui page grid" ref="resource" itemScope itemType={this.props.resourceType} itemID={this.props.resource}>
                <div className="ui column">
                    {breadcrumb}
                    <h2>
                        <a target="_blank" href={'/export/NTriples/' + encodeURIComponent(this.props.datasetURI) + '/' + encodeURIComponent(this.props.resource)}><i className="blue icon user"></i></a> <a href={this.props.resource} target="_blank">{this.props.title}</a>&nbsp;&nbsp;
                        {cloneable ?
                            <a className="medium ui circular basic icon button" onClick={this.handleCloneResource.bind(this, this.props.datasetURI, decodeURIComponent(this.props.resource))} title="clone this resource"><i className="icon teal superscript"></i></a>
                        : ''}
                    </h2>
                    <div className="ui grid">
                      <div className="four wide column">
                          <a className="olive card">
                            <div className="image">
                              {picture ? <img className="ui medium rounded image" src={picture}/> : <img className="ui medium rounded image" src="/assets/img/person.png"/>}
                            </div>
                          </a>

                      </div>
                      <div className="twelve wide column">
                          <div className='ui huge divided list'>
                              {birthDate ? <div className='item'><i className='ui icon circle thin'></i> {birthDate} {birthPlace ? '('+URIUtil.getURILabel(birthPlace)+')' : ''}</div> : ''}
                              {deathDate ? <div className='item'><i className='ui icon circle'></i> {deathDate} {deathPlace ? '('+URIUtil.getURILabel(deathPlace)+')' : ''}</div> : ''}
                              {knownFor ? <div className='item ui labels'> {knownForDIV}</div>: ''}
                              {aboutP ? <div className='item'> {aboutP}</div>: ''}
                              <div className='item'></div>
                          </div>
                      </div>
                    </div>
                    <div className='ui bottom attached button fluid' onClick={this.toggleShowMore.bind(this)}>{!this.state.showDetails ? <span><i className="ui toggle down icon"></i>show details...</span> : <span><i className="ui toggle up icon"></i>hide details...</span>}</div>
                    <div className={detailClasses}>
                        {mainDIV}
                    </div>
                </div>
            </div>
        );
    }
}
PersonResource.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
export default PersonResource;
