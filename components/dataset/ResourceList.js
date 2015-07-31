import React from 'react';
import {NavLink} from 'fluxible-router';
import URIUtil from '../utils/URIUtil';
class ResourceList extends React.Component {
    componentDidMount() {
    }
    buildLink(v, g, title, icon){
        if(this.props.OpenInNewTab){
            return (
                <a href={'/dataset/' + g + '/resource/' + v} target="_blank"><i className={icon}></i> {title} </a>
            );
        }else{
            return (
                <NavLink routeName="resource" className="ui" href={'/dataset/' + g + '/resource/' + v}>
                    <div className="content"> <i className={icon}></i> {title} </div>
                </NavLink>
            );
        }
    }
    includesProperty(list, resource) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource){
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource) {
        if(this.props.enableAuthentication) {
            if(user){
                if(parseInt(user.isSuperUser)){
                    return {access: true, type: 'full'};
                }else{
                    if(graph && user.editorOfGraph.indexOf(graph) !== -1){
                        return {access: true, type: 'full'};
                    }else{
                        if(resource && user.editorOfResource.indexOf(resource) !== -1){
                            return {access: true, type: 'full'};
                        }else{
                            if(resource && this.includesProperty(user.editorOfProperty, resource)){
                                return {access: true, type: 'partial'};
                            }else{
                                return {access: false};
                            }
                        }
                    }
                }
            }else{
                return {access: false};
            }
        }else{
            return {access: true, type: 'full'};
        }
    }
    render() {
        let self = this;
        let user = this.context.getUser();
        let graphName = this.props.graphName;
        let userAccess, title, list, dbClass = 'black cube icon';
        if(!this.props.resources.length){
            list = <div className="ui warning message"><div className="header"> There was no resource in the selected dataset! This might be due to the connection problems. Please check the connection parameters of your dataset's Sparql endpoint or add resources to your dataset...</div></div>;
        }else{
            list = this.props.resources.map((node, index) => {
                title = node.title ? node.title : (node.label ? node.label : URIUtil.getURILabel(node.v));
                if(!self.props.enableAuthentication) {
                    dbClass = 'black cube icon';
                    if(self.props.config && typeof self.props.config.readOnly !== 'undefined' && !self.props.config.readOnly){
                       dbClass = 'green cube icon';
                    }
                }else{
                    userAccess = self.checkAccess(user, node.g, node.v);
                    if(userAccess.access){
                        if(userAccess.type === 'full'){
                            dbClass = 'green cube icon';
                        }else{
                            dbClass = 'yellow cube icon';
                        }
                    }else{
                        dbClass = 'black cube icon';
                    }
                }
                return (
                    <div className="item animated fadeIn" key={index}>
                        {self.buildLink(encodeURIComponent(node.v), encodeURIComponent(node.g), title, dbClass)}
                    </div>
                );
            });
        }
        return (
            <div className={'ui ' + (this.props.isBig ? 'big' : '') + ' divided animated list'} ref="resourceList">
                {list}
            </div>
        );
    }
}
ResourceList.contextTypes = {
    getUser: React.PropTypes.func
};
export default ResourceList;
