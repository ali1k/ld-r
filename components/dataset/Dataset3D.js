import React from 'react';
import ResourceList from './ResourceList';
import ResourceListPager from './ResourceListPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';
import URIUtil from '../utils/URIUtil';
import {Popup} from 'semantic-ui-react';
import { Component } from 'react';
import { Renderer, Camera, Scene } from 'react-threejs';

class Dataset3D extends React.Component {
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
        /*
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
        */
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
        //let rendererSize = 300;
        //let rotation = 1;
        return (
            <div className="ui fluid container ldr-padding-more" ref="dataset">
                <div className="ui grid">
                    <div className="ui column">
                        <Renderer size={rendererSize}>
                            <Camera position={{ z: 5 }} />
                            <Scene>
                                <MyCube color={0x00ff00} rotation={rotation}>
                                    <MyCube color={0xff0000} position={{ y: 2 }} />
                                    <MyCube color={0x0000ff} position={{ z: 3 }} />
                                </MyCube>
                            </Scene>
                        </Renderer>)
                    </div>
                </div>
            </div>
        );
    }
}
export default Dataset3D;
