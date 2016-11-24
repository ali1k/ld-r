import React from 'react';
import ReactDOM from 'react-dom';
import {navigateAction} from 'fluxible-router';
import {enableAuthentication, enableAddingNewDatasets, baseResourceDomain} from '../configs/general';
import { Button, Divider, Form } from 'semantic-ui-react';
import url from 'url';
import createEmptyDataset from '../actions/createEmptyDataset';
import createFromExistingDataset from '../actions/createFromExistingDataset';

class NewDataset extends React.Component {
    constructor(props){
        super(props);
        this.state = {datasetLabel: '', endpointURI: '', graphName: ''};
    }
    componentDidMount() {

    }
    handleChange(element, e){

        if(element=== 'datasetLabel'){
            this.setState({datasetLabel: e.target.value.trim()});
        }else if(element=== 'endpointURI'){
            this.setState({endpointURI: e.target.value.trim()});
        }else if(element=== 'graphName'){
            this.setState({graphName: e.target.value.trim()});
        }
    }
    handleCreateDataset() {
        let datasetURI, datasetLabel, endpointURI, graphName, host, port, path, endpointType;
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
        if(!this.state.endpointURI){
            this.context.executeAction(createEmptyDataset, {
                datasetLabel: datasetLabel,
                datasetURI: datasetURI
            });
        }else{
            let parsed = url.parse(this.state.endpointURI);
            host = parsed.hostname;
            path = parsed.pathname;
            if(parsed.port){
                port = parsed.port;
            }else{
                port = 80;
            }
            endpointType = 'ClioPatria';
            this.context.executeAction(createFromExistingDataset, {
                datasetLabel: datasetLabel,
                datasetURI: datasetURI,
                graphName: graphName,
                host: host,
                port: port,
                path: path,
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
        if(!errorDIV){
            formDIV =
            <Form size='big'>
                <Form.Field label='Dataset Label' control='input' placeholder='Dataset Label / or leave empty for a random name!' onChange={this.handleChange.bind(this, 'datasetLabel')}/>

                <Form.Field label='URL of the SPARQL Endpoint' control='input' placeholder='URL of the SPARQL Endpoint / or leave it empty for generic one!' onChange={this.handleChange.bind(this, 'endpointURI')}/>

                <Form.Field label='Graph Name' control='input' placeholder='Graph Name / or leave it empty for all graphs' onChange={this.handleChange.bind(this, 'graphName')}/>
                <Divider hidden />
                <div className='ui big blue button' onClick={this.handleCreateDataset.bind(this)}>Add Dataset</div>
                <Divider hidden />
            </Form>;
        }
        return (
            <div className="ui page grid" ref="datasets">
                <div className="ui column">
                    <h2>Add a new dataset</h2>
                    {errorDIV}
                    {formDIV}
                </div>
            </div>
        );
    }
}
NewDataset.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
export default NewDataset;
