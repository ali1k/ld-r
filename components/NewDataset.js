import React from 'react';
import PropTypes from 'prop-types';
//import ReactDOM from 'react-dom';
import {navigateAction} from 'fluxible-router';
import {enableAuthentication, enableAddingNewDatasets, baseResourceDomain} from '../configs/general';
import { Button, Divider, Form } from 'semantic-ui-react';
import PrefixBasedInput from './object/editor/individual/PrefixBasedInput';
import url from 'url';
import createEmptyDataset from '../actions/createEmptyDataset';
import createFromExistingDataset from '../actions/createFromExistingDataset';

class NewDataset extends React.Component {
    constructor(props){
        super(props);
        this.state = {datasetLabel: '', endpointURI: '', graphName: '', resourceFocusType: ''};
    }
    componentDidMount() {

    }
    handleChange(element, e){
        if(element=== 'datasetLabel'){
            this.setState({datasetLabel: e.target.value.trim()});
        }else if(element=== 'graphName'){
            this.setState({graphName: e.target.value.trim()});
        }
    }
    handleResourceFocusTypeChange(val){
        this.setState({resourceFocusType: val.trim()});
    }
    handleEndpointURIChange(val){
        this.setState({endpointURI: val.trim()});
    }
    handleCreateDataset() {
        let user , tmp = this.context.getUser();
        //we do not need this for super user
        if(tmp){
            if(!tmp.isSuperUser || !parseInt(tmp.isSuperUser)){
                user = tmp.id;
            }
        }
        let datasetURI, datasetLabel, endpointURI, graphName, resourceFocusType, host, port, path, protocol, endpointType;
        graphName= 'default';
        datasetLabel= 'd' + Math.round(+new Date() / 1000);
        datasetURI= baseResourceDomain[0] + '/' + datasetLabel;
        //do not add two slashes
        if(baseResourceDomain[0].slice(-1) === '/'){
            datasetURI = baseResourceDomain[0] + datasetLabel;
        }

        if(this.state.datasetLabel){
            datasetLabel = this.state.datasetLabel;
        }
        if(this.state.graphName){
            graphName = this.state.graphName;
        }
        if(this.state.resourceFocusType){
            resourceFocusType = this.state.resourceFocusType;
        }
        if(!this.state.endpointURI){
            this.context.executeAction(createEmptyDataset, {
                datasetLabel: datasetLabel,
                datasetURI: datasetURI,
                user: user
            });
        }else{
            endpointURI = this.state.endpointURI;
            if(endpointURI.indexOf('http://') === -1 && endpointURI.indexOf('https://') === -1){
                endpointURI = 'http://' + endpointURI;
            }
            let parsed = url.parse(endpointURI);
            host = parsed.hostname;
            path = parsed.pathname;
            if(parsed.port){
                port = parsed.port;
            }else{
                port = 80;
            }
            if(parsed.protocol){
                protocol = parsed.protocol.replace(':', '');
            }else{
                protocol = 'http';
            }
            endpointType = 'ClioPatria';
            this.context.executeAction(createFromExistingDataset, {
                datasetLabel: datasetLabel,
                datasetURI: datasetURI,
                graphName: graphName,
                resourceFocusType: resourceFocusType,
                host: host,
                port: port,
                path: path,
                protocol: protocol,
                endpointType: endpointType
            });
        }

    }
    render() {
        let formDIV, errorDIV, self = this;
        let newDatasetID, newDatasetURI;
        let user = this.context.getUser();
        if(enableAuthentication && !user){
            errorDIV = <div className="ui warning message"><div className="header"> Please <a href="/register">Register</a> or <a href="/login">Login</a> to see the datasets.</div></div>;
        }else{
            if(!enableAddingNewDatasets){
                errorDIV = <div className="ui warning message"><div className="header"> It is not possible to add new datasets in this application!</div></div>;
            }
        }
        const commonEndpoints = [
            {'title': 'http://dbpedia.org/sparql'},
            {'title': 'http://live.dbpedia.org/sparql'}
        ]
        if(!errorDIV){
            formDIV =
            <Form size='big'>
                <Form.Field label='Dataset Label' control='input' placeholder='Dataset Label / or leave empty for a random name!' onChange={this.handleChange.bind(this, 'datasetLabel')}/>
                <div>
                    <b>URL of the SPARQL Endpoint</b>
                    <PrefixBasedInput autocompletelist={commonEndpoints} noFocus={true} spec={{value:''}} onDataEdit={this.handleEndpointURIChange.bind(this)} placeholder="URL of the SPARQL Endpoint / or leave it empty to use generic one in your local config" allowActionByKey={false}/>
                </div>
                <Divider hidden />
                {this.state.graphName || this.state.endpointURI ?
                    <Form.Field label='Graph Name' control='input' placeholder='Graph Name / or leave it empty for all graphs' onChange={this.handleChange.bind(this, 'graphName')}/>
                    : ''}
                {this.state.resourceFocusType || this.state.endpointURI ?
                    <div>
                        <b>Resource Focus Type</b>
                        <PrefixBasedInput includeOnly={['classes']} noFocus={true} spec={{value:''}} onDataEdit={this.handleResourceFocusTypeChange.bind(this)} placeholder="Resource Focus Type / or leave it empty for all resource types" onEnterPress={this.handleCreateDataset.bind(this)} allowActionByKey={true}/>
                    </div>
                    : ''}
                <Divider hidden />
                <div className='ui big blue button' onClick={this.handleCreateDataset.bind(this)}>Add Dataset</div>
                <Divider hidden />
            </Form>;
        }
        return (
            <div className="ui fluid container ldr-padding-more" ref="datasets">
                <div className="ui grid">
                    <div className="ui column">
                        <h2>Add a new dataset</h2>
                        {errorDIV}
                        {formDIV}
                    </div>
                </div>
            </div>
        );
    }
}
NewDataset.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
export default NewDataset;
