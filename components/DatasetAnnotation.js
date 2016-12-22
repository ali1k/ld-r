import React from 'react';
import ReactDOM from 'react-dom';
import {connectToStores} from 'fluxible-addons-react';
import DatasetAnnotationStore from '../stores/DatasetAnnotationStore';
import {navigateAction} from 'fluxible-router';
import {enableAuthentication, enableDatasetAnnotation, baseResourceDomain} from '../configs/general';
import { Button, Divider, Form, Progress } from 'semantic-ui-react';
import PrefixBasedInput from './object/editor/individual/PrefixBasedInput';
import url from 'url';
import annotateDataset from '../actions/annotateDataset';
import getAnnotatedResourcesCount from '../actions/getAnnotatedResourcesCount';

class DatasetAnnotation extends React.Component {
    constructor(props){
        super(props);
        this.state = {datasetURI: '', resourceType: '', propertyURI: ''};

    }
    componentDidMount() {

    }
    componentDidUpdate() {

    }
    handleChange(element, e){
        if(element=== 'datasetURI'){
            this.setState({datasetURI: e.target.value.trim()});
        }else if(element=== 'resourceType'){
            this.setState({resourceType: e.target.value.trim()});
        }else if(element=== 'propertyURI'){
            this.setState({propertyURI: e.target.value.trim()});
        }
    }
    handleAnnotateDataset() {
        let self=this;
        if(this.state.datasetURI && this.state.propertyURI){
            this.context.executeAction(annotateDataset, {
                id: this.state.datasetURI,
                resourceType: this.state.resourceType,
                propertyURI: this.state.propertyURI
            });
        }
    }
    render() {
        let self = this, errorDIV='', formDIV='';
        let user = this.context.getUser();
        if(enableAuthentication && !user){
            errorDIV = <div className="ui warning message"><div className="header"> Please <a href="/register">Register</a> or <a href="/login">Login</a> to see the datasets.</div></div>;
        }else{
            if(!enableDatasetAnnotation){
                errorDIV = <div className="ui warning message"><div className="header"> It is not possible to annotate datasets in this application!</div></div>;
            }
        }
        if(!errorDIV){
            formDIV =
            <Form size='big'>
                <Form.Field label='Dataset URI' control='input' placeholder='URI of the dataset to be annotated' onChange={this.handleChange.bind(this, 'datasetURI')}/>
                <Form.Field label='Resource Type' control='input' placeholder='URI of the resource types to be annotate / leave empty for all resources' onChange={this.handleChange.bind(this, 'resourceType')}/>
                <Form.Field label='Property URI' control='input' placeholder='URI of the property for which the values are annotated' onChange={this.handleChange.bind(this, 'propertyURI')}/>
                <Divider hidden />
                <div className='ui big blue button' onClick={this.handleAnnotateDataset.bind(this)}>Annotate  Dataset</div>
                <Divider hidden />
            </Form>;
        }
        return (
            <div className="ui page grid" ref="datasets">
                <div className="ui column">
                    <h2>Annotate dataset</h2>
                    {errorDIV}
                    {formDIV}
                    <Progress percent={Math.floor((this.props.DatasetAnnotationStore.stats.annotated / this.props.DatasetAnnotationStore.stats.total) * 100)} progress success active>
                        Annotating {this.props.DatasetAnnotationStore.stats.annotated}/{this.props.DatasetAnnotationStore.stats.total} items
                    </Progress>
                </div>
            </div>
        );
    }
}
DatasetAnnotation.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
DatasetAnnotation = connectToStores(DatasetAnnotation, [DatasetAnnotationStore], function (context, props) {
    return {
        DatasetAnnotationStore: context.getStore(DatasetAnnotationStore).getState()
    };
});
export default DatasetAnnotation;
