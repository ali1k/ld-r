import React from 'react';
import ReactDOM from 'react-dom';
import {navigateAction} from 'fluxible-router';
import {enableAuthentication, enableAddingNewDatasets, baseResourceDomain} from '../configs/general';
import { Button, Divider, Form } from 'semantic-ui-react';
import url from 'url';
import createEmptyDataset from '../actions/createEmptyDataset';

class NewDataset extends React.Component {
    constructor(props){
        super(props);
        this.state = {datasetLabel: '', endpointURI: ''};
    }
    componentDidMount() {

    }
    handleChange(element, e){

        if(element=== 'datasetLabel'){
            this.setState({datasetLabel: e.target.value.trim()});
        }else if(element=== 'endpointURI'){
            this.setState({endpointURI: e.target.value.trim()});
        }
    }
    handleCreateDataset() {
        let datasetURI, datasetLabel, endpointURI;
        datasetLabel= 'd' + Math.round(+new Date() / 1000);
        datasetURI= baseResourceDomain[0] + '/' + datasetLabel;
        //do not add two slashes
        if(baseResourceDomain[0].slice(-1) === '/'){
            datasetURI = baseResourceDomain[0] + datasetLabel;
        }

        if(this.state.datasetLabel){
            datasetLabel = this.state.datasetLabel;
        }
        if(!this.state.endpointURI){
            this.context.executeAction(createEmptyDataset, {
                datasetLabel: datasetLabel,
                datasetURI: datasetURI
            });
        }
    }
    render() {
        let errorDIV, self = this;
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
            newDatasetID = 'd' + Math.round(+new Date() / 1000);
            newDatasetURI = baseResourceDomain[0] + '/' + newDatasetID;
            //do not add two slashes
            if(baseResourceDomain[0].slice(-1) === '/'){
                newDatasetURI = baseResourceDomain[0] + 'd' + newDatasetID;
            }
        }
        //console.log(url.parse('http://dbpedia.org'));
        //hostname
        //pathname
        //port 80 if null
        return (
            <div className="ui page grid" ref="datasets">
                <div className="ui column">
                    <h2>Add a new dataset</h2>
                    {errorDIV}
                    <Form size='big'>
                        <Form.Field label='Dataset Label' control='input' placeholder='Dataset Label' onChange={this.handleChange.bind(this, 'datasetLabel')}/>

                        <Form.Field label='URL of the SPARQL Endpoint' control='input' placeholder='URL of the SPARQL Endpoint' onChange={this.handleChange.bind(this, 'endpointURI')}/>
                        <Divider hidden />
                        <div className='ui big blue button' onClick={this.handleCreateDataset.bind(this)}>Add Dataset</div>
                        <Divider hidden />
                    </Form>
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
