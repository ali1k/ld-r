import React from 'react';
import {NavLink} from 'fluxible-router';
import URIUtil from '../utils/URIUtil';
import classNames from 'classnames/bind';

class ResourceList extends React.Component {
    componentDidMount() {}
    buildLink(v, g, title, image, icon, cloneable) {
        let self = this;
        let cloneDIV = '';
        if (cloneable) {
            cloneDIV = <span className="mini ui circular basic icon button" onClick={self.handleCloneResource.bind(self, decodeURIComponent(g), decodeURIComponent(v))} title="clone this resource"><i className="icon teal superscript"></i></span>;
        }
        //in the faceted browser
        if (this.props.OpenInNewTab) {
            let titleDIV = <div className="content">
                                <a href={'/dataset/' + g + '/resource/' + v} target="_blank" className="ui"> <i className={icon}></i>{title} </a>
                            </div>;
            if(this.props.config && this.props.config.resourceImageProperty){
                return (
                    <div>
                        <div className="content">
                                <div className="ui fluid card" style={{maxWidth: 150, maxHeight: 235, minHeight: 235}}>
                                    <div className="image">
                                        <a href={'/dataset/' + g + '/resource/' + v} target="_blank" className="ui"> <img className="ui small image" src={image ? image : '/assets/img/image.png'} style={{maxHeight: 150, minHeight: 150}} /></a>
                                    </div>
                                    {titleDIV}
                                </div>
                        </div>
                    </div>
                );
            }else{
                return (
                    <div>
                        {titleDIV}
                    </div>
                );
            }
        } else {
            let titleDIV = <div className="content">
                                <NavLink routeName="resource" className="ui" href={'/dataset/' + g + '/resource/' + v}> <i className={icon}></i>{title}&nbsp;{cloneDIV}</NavLink>
                            </div>;
            if(this.props.config && this.props.config.resourceImageProperty){
                return (
                    <div>
                        <div className="content">
                                <div className="ui fluid card" style={{maxWidth: 150, maxHeight: 235, minHeight: 235}}>
                                    <div className="image">
                                        <NavLink routeName="resource" className="ui" href={'/dataset/' + g + '/resource/' + v}> <img className="ui small image" src={image ? image : '/assets/img/image.png'} style={{maxHeight: 150, minHeight: 150}}/></NavLink>
                                    </div>
                                    {titleDIV}
                                </div>
                        </div>
                    </div>
                );
            }else{
                return (
                    <div>
                        {titleDIV}
                    </div>
                );
            }
        }
    }
    handleCloneResource(datasetURI, resourceURI, e) {
        this.props.onCloneResource(datasetURI, resourceURI);
        e.stopPropagation();
    }
    render() {
        let self = this;
        let user = this.context.getUser();
        let datasetURI = this.props.datasetURI;
        let userAccess, itemClass,
            title,
            image,
            list,
            dbClass = 'black cube icon';
        let cloneable = 0;
        if (self.props.config && typeof self.props.config.allowResourceClone !== 'undefined' && parseInt(self.props.config.allowResourceClone)) {
            cloneable = 1;
        }
        if (!this.props.resources.length) {
            list = <div className="ui warning message">
                <div className="header">
                    There was no resource in the selected dataset! This might be due to the connection problems. Please check the connection parameters of your dataset's Sparql endpoint or add resources to your dataset...</div>
            </div>;
        } else {

            list = this.props.resources.map((node, index) => {
                title = node.title
                    ? node.title
                    : (node.label
                        ? node.label
                        : URIUtil.getURILabel(node.v));
                image = node.image ? node.image : '';
                itemClass = classNames({
                    'ui': true,
                    'item fadeIn': true,
                    'animated': !cloneable
                });
                if (!self.props.enableAuthentication) {
                    dbClass = 'black cube icon';
                    if (self.props.config && typeof self.props.config.readOnly !== 'undefined' && !self.props.config.readOnly) {
                        dbClass = 'green cube icon';
                    }
                } else {
                    userAccess = node.accessLevel;
                    if (userAccess.access) {
                        if (userAccess.type === 'full') {
                            dbClass = 'green cube icon';
                        } else {
                            dbClass = 'yellow cube icon';
                        }
                    } else {
                        dbClass = 'black cube icon';
                    }
                }
                return (
                    <div className={itemClass} key={index}>
                        {self.buildLink(encodeURIComponent(node.v), encodeURIComponent(node.d), title, image, dbClass, cloneable)}
                    </div>
                );
            });
        }
        let listClasses = classNames({
            'ui': true,
            'big': this.props.isBig,
            'animated': !cloneable,
            'divided list': this.props.config && !this.props.config.resourceImageProperty,
            'cards': this.props.config && this.props.config.resourceImageProperty
        });
        return (
            <div className={listClasses} ref="resourceList">
                {list}
            </div>
        );
    }
}
ResourceList.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
export default ResourceList;
