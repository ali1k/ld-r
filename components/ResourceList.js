import React from 'react';
import {enableAuthentication} from '../configs/reactor';
import {NavLink} from 'fluxible-router';

class ResourceList extends React.Component {
    componentDidMount() {
    }
    buildLink(v, g, title, icon){
        if(this.props.OpenInNewTab){
            return (
                <a href={'/dataset/' + g + '/resource/' + v} target="_blank">  <i className={icon}></i> {title}  </a>
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
        if(enableAuthentication) {
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
    getPropertyLabel(uri) {
        let property = '';
        let tmp = uri;
        let tmp2 = tmp.split('#');
        if(tmp2.length > 1){
            property = tmp2[1];
        }else{
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
        }
        return property;
    }
    render() {
        let self = this;
        let user = this.context.getUser();
        let graphName = this.props.graphName;
        let userAccess, title, list, dbClass = 'blue cube icon';
        if(!this.props.resources.length){
            list = <div className="ui warning message"><div className="header"> There was no resource in the selected dataset! Either add resources to your dataset or go to another dataset which has resources...</div></div>;
        }else{
            list = this.props.resources.map((node, index) => {
                title = node.title ? node.title : (node.label ? node.label : self.getPropertyLabel(node.v));
                if(!enableAuthentication) {
                    dbClass = 'green cube icon';
                }else{
                    userAccess = self.checkAccess(user, node.g, node.v);
                    if(userAccess.access){
                        if(userAccess.type === 'full'){
                            dbClass = 'green cube icon';
                        }else{
                            dbClass = 'yellow cube icon';
                        }
                    }else{
                        dbClass = 'blue cube icon';
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
