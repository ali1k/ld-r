import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'fluxible-router';
import URIUtil from '../../utils/URIUtil';
import { Header, Table } from 'semantic-ui-react';
import BasicAggregateMapView from '../../object/viewer/aggregate/BasicAggregateMapView';
import classNames from 'classnames/bind';
import ObjectIViewer from '../../object/ObjectIViewer';

class BasicResourceList extends React.Component {
    componentDidMount() {}
    buildLink(useA, v, g, title, image, icon, cloneable) {
        let self = this;
        let cloneDIV = '';
        if (cloneable) {
            cloneDIV = <span className="mini ui circular basic icon button" onClick={self.handleCloneResource.bind(self, decodeURIComponent(g), decodeURIComponent(v))} title="clone this resource"><i className="icon teal superscript"></i></span>;
        }
        //on the map: todo:handle it with React DOM
        if(useA){
            let titleHTML = `
                <div class="content">
                    <a href="/dataset/${g}/resource/${v}" target="_blank" class="ui"> <i class="${icon}"></i>${title}</a>
                </div>
            `;
            if(this.props.config && this.props.config.resourceImageProperty){
                return `
                <div>
                    <div class="content">
                        <div class="ui fluid card" style="max-width: 150px; max-height: 235px; min-height: 235px;">
                            <div class="image">
                                <a href="/dataset/${g}/resource/${v}" target="_blank" class="ui"> <img class="ui small image" src="${(image ? image : '/assets/img/image.png')}"  style="max-height: 150px; min-height: 150px;" /></a>
                            </div>
                            ${titleHTML}
                        </div>
                    </div>
                </div>
                `;
            }else{
                return titleHTML;
            }

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
                <NavLink routeName="resource" className="ui" href={'/dataset/' + g + '/resource/' + v}> <i className={icon}></i>{title}</NavLink>&nbsp;{cloneDIV}
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
    checkAnalysisProps(){
        let out = 0;
        if(this.props.resources.length){
            if(Object.keys(this.props.resources[0].propsForAnalysis).length){
                out = 1;
                return out;
            }else{
                return 0
            }
        }else{
            return 0 ;
        }
        return out;
    }
    getAnalysisPropsConfgis(facetConfigs){
        let out = {};
        let index, tmp = [];
        if(!Object.keys(facetConfigs).length){
            return out;
        }
        if(this.props.resources.length){
            if(this.props.resources[0].propsForAnalysis){
                for(let prop in this.props.resources[0].propsForAnalysis){
                    tmp = prop.split('_');
                    if(tmp.length > 1){
                        index = tmp[1];
                        //hanlde multiple _
                        if(tmp.length > 2){
                            tmp.shift();
                            index = tmp.join('_');
                        }
                        if(facetConfigs){
                            for(let prop2 in facetConfigs){
                                if(prop2.indexOf(index) !== -1){
                                    out[prop] = facetConfigs[prop2];
                                }
                            }
                        }
                    }
                    return out;
                }
            }
        }
        return out;
    }
    render() {
        //to apply the same config in result list
        let analysisPropsConfgis = this.getAnalysisPropsConfgis(this.props.facetConfigs);
        //console.log(analysisPropsConfgis);
        let self = this;
        let user = this.context.getUser();
        let datasetURI = this.props.datasetURI;
        let userAccess, itemClass,
            title,
            image,
            resourceDIV,
            geo,
            instances =[],
            list,
            dbClass = 'black cube icon';
        let theaderDIV, dtableHeaders = [], dtableCells = [];
        let cloneable = 0;
        if (self.props.config && typeof self.props.config.allowResourceClone !== 'undefined' && parseInt(self.props.config.allowResourceClone)) {
            cloneable = 1;
        }
        if(!self.props.cloneable){
            cloneable = 0;
        }
        if (!this.props.resources.length) {
            list = <div className="ui warning message">
                <div className="header">
                    There was no resource in the selected dataset! This might be due to the connection problems. Please check the connection parameters of your dataset&apos;s Sparql endpoint or add resources to your dataset...</div>
            </div>;
        } else {
            if(this.checkAnalysisProps()){
                for(let prop in this.props.resources[0].propsForAnalysis){
                    dtableHeaders.push(<Table.HeaderCell key={prop}>{prop}</Table.HeaderCell>);
                }
                theaderDIV =
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell singleLine>Title</Table.HeaderCell>
                        {dtableHeaders}
                    </Table.Row>
                </Table.Header>
                ;
            }
            list = this.props.resources.map((node, index) => {
                title = node.title
                    ? node.title
                    : (node.label
                        ? node.label
                        : URIUtil.getURILabel(node.v));
                image = node.image ? node.image : '';
                geo = node.geo ? node.geo : '';
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
                dtableCells = [];
                if(self.checkAnalysisProps()){
                    for(let prop in node.propsForAnalysis){
                        dtableCells.push(<Table.Cell key={'c'+prop} title={node.propsForAnalysis[prop]}>{Object.keys(analysisPropsConfgis).length && analysisPropsConfgis[prop] ? <ObjectIViewer datasetURI={this.props.datasetURI} property={prop} spec={{value: node.propsForAnalysis[prop]}} config={analysisPropsConfgis[prop]}/> : URIUtil.getURILabel(node.propsForAnalysis[prop])}</Table.Cell>);
                    }
                    resourceDIV =
                        <Table.Row key={index}>
                            <Table.Cell>{self.buildLink(0, encodeURIComponent(node.v), encodeURIComponent(node.d), title, image, dbClass, cloneable)}</Table.Cell>
                            {dtableCells}
                        </Table.Row>;
                }else{
                    resourceDIV =
                        <div className={itemClass} key={index}>
                            {self.buildLink(0, encodeURIComponent(node.v), encodeURIComponent(node.d), title, image, dbClass, cloneable)}
                        </div>;
                }
                if(self.props.config && self.props.config.resourceGeoProperty && geo) {
                    instances.push({value: geo, hint: self.buildLink(1, encodeURIComponent(node.v), encodeURIComponent(node.d), title, image, dbClass, cloneable)});
                }

                return resourceDIV;
            });
        }
        let listClasses = classNames({
            'ui': true,
            'big': this.props.isBig,
            'animated': !cloneable,
            'divided list': this.props.config && !this.props.config.resourceImageProperty,
            'cards': this.props.config && this.props.config.resourceImageProperty
        });

        let finalOutDIV = list;
        if(self.checkAnalysisProps()){
            finalOutDIV =
            <Table celled padded striped selectable compact>
                {theaderDIV}
                <Table.Body>
                    {list}
                </Table.Body>
            </Table>
            ;
        }

        return (
            <div className={listClasses} ref="resourceList" style={{overflow: 'auto'}}>
                {this.props.config && this.props.config.resourceGeoProperty ?
                    <BasicAggregateMapView  mapWidth={950} mapHeight={620} zoomLevel={2} spec={{instances: instances}} config={this.props.config}/>
                    : finalOutDIV}
            </div>
        );
    }
}
BasicResourceList.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
export default BasicResourceList;
