import React from 'react';
import {NavLink} from 'fluxible-router';
import URIUtil from '../utils/URIUtil';
import cloneResource from '../../actions/cloneResource';

class ResourceList extends React.Component {
    componentDidMount() {}
    buildLink(v, g, title, icon, cloneable) {
        let self = this;
        let cloneDIV = '';
        if (cloneable) {
            cloneDIV = <a className="ui" onClick={self.handleCloneResource.bind(self, decodeURIComponent(g), decodeURIComponent(v))} title="clone this resource"><i className="icon violet superscript"></i></a> ;
        }

        if (this.props.OpenInNewTab) {
            return (
                <div>
                    <div className="content">
                        <a href={'/dataset/' + g + '/resource/' + v} target="_blank" className="ui">
                            <i className={icon}></i>
                            {title}
                        </a>
                         &nbsp;{cloneDIV}
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <div className="content">
                        <NavLink routeName="resource" className="ui" href={'/dataset/' + g + '/resource/' + v}>
                            <i className={icon}></i>
                            {title}
                        </NavLink>
                         &nbsp;{cloneDIV}
                    </div>
                </div>

            );
        }
    }
    handleCloneResource(datasetURI, resourceURI, e) {
        this.context.executeAction(cloneResource, {
            dataset: datasetURI,
            resourceURI: resourceURI
        });
        e.stopPropagation();
    }
    includesProperty(list, resource) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource) {
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource) {
        if (this.props.enableAuthentication) {
            if (user) {
                if (parseInt(user.isSuperUser)) {
                    return {access: true, type: 'full'};
                } else {
                    if (graph && user.editorOfDataset.indexOf(graph) !== -1) {
                        return {access: true, type: 'full'};
                    } else {
                        if (resource && user.editorOfResource.indexOf(resource) !== -1) {
                            return {access: true, type: 'full'};
                        } else {
                            if (resource && this.includesProperty(user.editorOfProperty, resource)) {
                                return {access: true, type: 'partial'};
                            } else {
                                return {access: false};
                            }
                        }
                    }
                }
            } else {
                return {access: false};
            }
        } else {
            return {access: true, type: 'full'};
        }
    }
    render() {
        let self = this;
        let user = this.context.getUser();
        let datasetURI = this.props.datasetURI;
        let userAccess,
            title,
            list,
            dbClass = 'black cube icon';
        let cloneable = 0;
        if (self.props.config && typeof self.props.config.allowResourceClone !== 'undefined' && parseInt(self.props.config.allowResourceClone)) {
            cloneable = 1;
        }
        let listClass = cloneable ? '' : ' animated';
        
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
                if (!self.props.enableAuthentication) {
                    dbClass = 'black cube icon';
                    if (self.props.config && typeof self.props.config.readOnly !== 'undefined' && !self.props.config.readOnly) {
                        dbClass = 'green cube icon';
                    }
                } else {
                    userAccess = self.checkAccess(user, node.d, node.v);
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
                    <div className={'item fadeIn' + listClass} key={index}>
                        {self.buildLink(encodeURIComponent(node.v), encodeURIComponent(node.d), title, dbClass, cloneable)}
                    </div>
                );
            });
        }
        return (
            <div className={'ui ' + (this.props.isBig
                ? 'big'
                : '') + ' divided list ' + listClass} ref="resourceList">
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
