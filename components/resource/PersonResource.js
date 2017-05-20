import React from 'react';
import PropTypes from 'prop-types';
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
        //check erros first
        if(this.props.error){
            return (
                <div className="ui fluid container ldr-padding-more" ref="personResource">
                    <div className="ui grid">
                        <div className="ui column">
                            <div className="ui warning message"><h2>{this.props.error}</h2></div>
                        </div>
                    </div>
                </div>
            )
        }
        //continue
        let picture, keywords, pbirthDate, obirthDate, pbirthPlace, obirthPlace, pdeathDate, odeathDate, pdeathPlace, odeathPlace, knownFor, aboutP, pName, firstName, lastName, children, spouse, depiction, thumbnail, homepage, email, comments, creatorDIV, dateDIV;
        let readOnly = 1;
        let user = this.context.getUser();
        let self = this;
        let accessLevel, isWriteable, configReadOnly;
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
                if(node.propertyURI === 'http://xmlns.com/foaf/0.1/depiction'){
                    depiction = node.instances[0].value;
                }
                if(node.propertyURI === 'http://xmlns.com/foaf/0.1/thumbnail'){
                    thumbnail = node.instances[0].value;
                }
                if(node.propertyURI === 'http://xmlns.com/foaf/0.1/homepage'){
                    homepage = node.instances[0].value;
                }
                if(node.propertyURI === 'http://www.w3.org/2006/vcard/ns#email'){
                    email = node.instances[0].value;
                }
                if(node.propertyURI === 'http://xmlns.com/foaf/0.1/firstName'){
                    firstName = node.instances[0].value;
                }
                if(node.propertyURI === 'http://xmlns.com/foaf/0.1/lastName'){
                    lastName = node.instances[0].value;
                }
                if(node.propertyURI === 'http://xmlns.com/foaf/0.1/name'){
                    pName = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/birthDate'){
                    obirthDate = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/property/birthDate'){
                    pbirthDate = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/birthPlace'){
                    obirthPlace = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/property/birthPlace'){
                    pbirthPlace = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/deathDate'){
                    odeathDate = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/property/deathDate'){
                    pdeathDate = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/deathPlace'){
                    odeathPlace = node.instances[0].value;
                }
                if(node.propertyURI === 'http://dbpedia.org/property/deathPlace'){
                    pdeathPlace = node.instances[0].value;
                }
                if(node.propertyURI === 'http://www.w3.org/2000/01/rdf-schema#comment'){
                    comments = node.instances;
                }
                if(node.propertyURI === 'http://dbpedia.org/property/children'){
                    children = node.instances;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/spouse'){
                    spouse = node.instances;
                }
                if(node.propertyURI === 'http://dbpedia.org/ontology/knownFor'){
                    knownFor = node.instances;
                }
                if(node.propertyURI === 'http://purl.org/dc/terms/subject'){
                    keywords = node.instances;
                }
                if(node.propertyURI === 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdOn'){
                    dateDIV = <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>;
                }else if(node.propertyURI === 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdBy') {
                    creatorDIV = <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>;
                } else {
                    return (
                        <PropertyReactor key={index} enableAuthentication={self.props.enableAuthentication} spec={node} readOnly={configReadOnly} config={node.config} datasetURI ={self.props.datasetURI } resource={self.props.resource} property={node.propertyURI} propertyPath= {self.props.propertyPath}/>
                    );
                }

            }
        });
        if(comments){
            aboutP = comments[0].value;
            comments.forEach((comment)=>{
                if(comment.lang && comment.lang === 'en'){
                    aboutP = comment.value;
                }
            });
        }
        let knownForDIV, keywordsDIV, spouseDIV, childrenDIV, deathPlace, birthPlace, birthDate, deathDate;
        if(depiction){
            picture = depiction;
        }else if(thumbnail){
            picture = thumbnail;
        }
        if(obirthPlace){
            birthPlace = obirthPlace;
        }else if(pbirthPlace){
            birthPlace = pbirthPlace;
        }
        if(obirthDate){
            birthDate = obirthDate;
        }else if(pbirthPlace){
            birthDate = pbirthDate;
        }
        if(odeathPlace){
            deathPlace = odeathPlace;
        }else if(pdeathPlace){
            deathPlace = pdeathPlace;
        }
        if(odeathDate){
            deathDate = odeathDate;
        }else if(pdeathPlace){
            deathDate = pdeathDate;
        }
        if(spouse){
            spouseDIV = spouse.map((node, index)=>{
                return (
                    <a key={index} className="ui basic label" href={'/dataset/' + encodeURIComponent(self.props.datasetURI) + '/resource/' + encodeURIComponent(node.value) }>{URIUtil.getURILabel(node.value)}</a>
                );
            });
        }
        if(children){
            childrenDIV = children.map((node, index)=>{
                return (
                    <a key={index} className="ui basic label" href={'/dataset/' + encodeURIComponent(self.props.datasetURI) + '/resource/' + encodeURIComponent(node.value) }>{URIUtil.getURILabel(node.value)}</a>
                );
            });
        }
        if(knownFor){
            knownForDIV = knownFor.map((node, index)=>{
                return (
                    <a key={index} className="ui tag label" href={'/dataset/' + encodeURIComponent(self.props.datasetURI) + '/resource/' + encodeURIComponent(node.value) }>{URIUtil.getURILabel(node.value)}</a>
                );
            });
        }
        if(keywords){
            keywordsDIV = keywords.map((node, index)=>{
                return (
                    <a key={index} className="ui tag label" href={'/dataset/' + encodeURIComponent(self.props.datasetURI) + '/resource/' + encodeURIComponent(node.value) }>{URIUtil.getURILabel(node.value)}</a>
                );
            });
        }
        let mainDIV = <div className="ui segment">
                        <div className="ui grid">
                            <div className="column ui list">
                                {list}
                                {dateDIV}
                                {creatorDIV}
                            </div>
                        </div>
                  </div>;
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
        let personTitle = this.props.title;
        if(pName){
            personTitle = pName;
        }
        if(firstName && lastName){
            personTitle = firstName + ' ' + lastName;
        }
        return (
            <div className="ui fluid container ldr-padding-more" ref="personResource">
                <div className="ui grid" ref="personResource">
                    <div className="ui column">
                        {breadcrumb}
                        <h2>
                            <a target="_blank" href={'/export/NTriples/' + encodeURIComponent(this.props.datasetURI) + '/' + encodeURIComponent(this.props.resource)}><i className="blue icon user"></i></a> <a href={this.props.resource} target="_blank">{personTitle}</a>&nbsp;&nbsp;
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
                                  {birthDate ? <div className='item'><i className="icons"><i className='ui icon circle thin'></i></i> {birthDate} {birthPlace ? <a href={'/dataset/' + encodeURIComponent(self.props.datasetURI ) + '/resource/' + encodeURIComponent(birthPlace)}>({URIUtil.getURILabel(birthPlace)})</a> : ''}</div> : ''}
                                  {deathDate ? <div className='item'><i className="icons"><i className='ui icon circle'></i></i> {deathDate} {deathPlace ? <a href={'/dataset/' + encodeURIComponent(self.props.datasetURI ) + '/resource/' + encodeURIComponent(deathPlace)}>({URIUtil.getURILabel(deathPlace)})</a> : ''}</div> : ''}
                                  {spouse ? <div className='item ui'><i className="icons"> <i className='ui icon  blue male'></i></i><i className="icons"> <i className='ui icon pink female'></i></i> {spouseDIV}</div>: ''}
                                  {children ? <div className='item ui'><i className="icons"><i className='ui icon green child'></i></i> {childrenDIV}</div>: ''}
                                  {aboutP ? <div className='item'> {aboutP}</div>: ''}
                                  {homepage ? <a className='item' href={homepage}> <i className="icons"><i className='ui icon violet home'></i></i> {homepage}</a>: ''}
                                  {email ? <a className='item' href={'mailto:'+email}> <i className="icons"><i className='ui icon blue mail outline'></i></i> {email}</a>: ''}
                                  {knownFor ? <div className='item ui labels'> {knownForDIV}</div>: ''}
                                  {!knownFor && keywords ? <div className='item ui labels'> {keywordsDIV}</div>: ''}

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
            </div>
        );
    }
}
PersonResource.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
export default PersonResource;
