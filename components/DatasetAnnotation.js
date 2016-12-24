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
import countAnnotatedResourcesWithProp from '../actions/countAnnotatedResourcesWithProp';

class DatasetAnnotation extends React.Component {
    constructor(props){
        super(props);
        this.state = {storingDataset: '', datasetURI: '', resourceType: '', propertyURI: '', annotationMode: 0, storeInNewDataset : false};
    }
    componentDidMount() {
    }
    componentDidUpdate() {

    }
    compareObjProps(a,b) {
        if (a.count < b.count)
            return 1;
        if (a.count > b.count)
            return -1;
        return 0;
    }
    generateTagArray(obj){
        let tags = [];
        for(let prop in obj){
            tags.push({uri: prop, count: obj[prop].count, text: obj[prop].text});
        }
        tags.sort(this.compareObjProps);
        //limit it to 500
        if(tags.length>500){
            tags = tags.slice(0, 500);
        }
        return tags;
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
    handleStoringCheckBox(e, t){
        if(t.value === '1'){
            //create a new random dataset URI
            let newDatasetURI = baseResourceDomain[0] + '/astore' + Math.round(+new Date() / 1000);
            //do not add two slashes
            if(baseResourceDomain[0].slice(-1) === '/'){
                newDatasetURI = baseResourceDomain[0] + 'astore' + Math.round(+new Date() / 1000);
            }
            this.setState({storeInNewDataset: true, storingDataset: newDatasetURI});
        }else{
            this.setState({storeInNewDataset: false, storingDataset: ''});
        }
    }
    startInterval(){
        let self=this;
        //set an interval for progress bar
        let intervalId = setInterval(()=>{
            self.context.executeAction(countAnnotatedResourcesWithProp, {
                id: self.state.storeInNewDataset ? self.state.storingDataset : self.state.datasetURI,
                resourceType: self.state.resourceType,
                propertyURI: self.state.propertyURI,
                inANewDataset: self.state.storeInNewDataset
            });
            if(self.props.DatasetAnnotationStore.stats.annotated && self.props.DatasetAnnotationStore.stats.annotated===self.props.DatasetAnnotationStore.stats.total){
                clearInterval(intervalId);
            }
        }, 2200);
        this.setState({intervalId: intervalId});
    }
    handleAnnotateDataset() {
        let self=this;
        if(self.state.datasetURI && self.state.propertyURI){
            self.startInterval();
            self.setState({annotationMode: 1});
            self.context.executeAction(annotateDataset, {
                id: self.state.datasetURI,
                resourceType: self.state.resourceType,
                propertyURI: self.state.propertyURI,
                storingDataset: self.state.storingDataset
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
        let tagsDIV = self.generateTagArray(this.props.DatasetAnnotationStore.tags).map((node, index)=>{
            return (<div className='item' key={index}><a href={node.uri} target="_blank">{node.text}</a> ({node.count})</div>);
        });
        if(!errorDIV){
            formDIV =
            <Form size='big'>
                <Form.Field label='Dataset URI' control='input' placeholder='URI of the dataset to be annotated' onChange={this.handleChange.bind(this, 'datasetURI')}/>
                <Form.Field label='Resource Type' control='input' placeholder='URI of the resource types to be annotate / leave empty for all resources' onChange={this.handleChange.bind(this, 'resourceType')}/>
                <Form.Field label='Property URI' control='input' placeholder='URI of the property for which the values are annotated' onChange={this.handleChange.bind(this, 'propertyURI')}/>
                <Form.Group>
                    <label>Store annotations in a new dataset?</label>
                    <Form.Radio label='No, just enrich the original dataset' name='storeAnn' value='0' checked={!this.state.storeInNewDataset} onChange={this.handleStoringCheckBox.bind(this)} />
                    <Form.Radio label='Yes, create a new dataset for annotations' name='storeAnn' value='1' checked={this.state.storeInNewDataset} onChange={this.handleStoringCheckBox.bind(this)} />
                </Form.Group>
                <Divider hidden />
                <div className='ui big blue button' onClick={this.handleAnnotateDataset.bind(this)}>Annotate  Dataset</div>
                <Divider hidden />
            </Form>;
        }
        let progressDIV = '';
        if(this.state.annotationMode){
            formDIV = '';
            progressDIV = <div>
                <div className='ui list'>
                    <div className='item'>Dataset: <b><a href={'/dataset/1/'+encodeURIComponent(this.state.datasetURI)}>{this.state.datasetURI}</a></b> {!this.state.storingDataset ? '' : <span>-><a href={'/dataset/1/'+encodeURIComponent(this.state.storingDataset)}>{this.state.storingDataset}</a></span>} </div>
                    {!this.state.resourceType ? '' : <div className='item'>Resource Type: <b>{this.state.resourceType}</b></div>}
                    <div className='item'>Property used: <b>{this.state.propertyURI}</b></div>
                </div>
                { (this.props.DatasetAnnotationStore.stats.annotated && this.props.DatasetAnnotationStore.stats.annotated===this.props.DatasetAnnotationStore.stats.total) ?
                    <Progress percent={100} progress success>
                        Annotated {this.props.DatasetAnnotationStore.stats.annotated}/{this.props.DatasetAnnotationStore.stats.total} items
                    </Progress>
                    :
                    <div>
                        <Progress percent={this.props.DatasetAnnotationStore.stats.annotated ? Math.floor((this.props.DatasetAnnotationStore.stats.annotated / this.props.DatasetAnnotationStore.stats.total) * 100) : 0} progress active color='blue'>
                            Annotating {this.props.DatasetAnnotationStore.stats.annotated}/{this.props.DatasetAnnotationStore.stats.total} items
                        </Progress>
                        <div className='ui segment'>
                            {this.props.DatasetAnnotationStore.currentText}
                        </div>
                    </div>
                }
                <div className='ui list'>
                    {tagsDIV}
                </div>
            </div>
        }
        return (
            <div className="ui page grid" ref="datasets">
                <div className="ui column">
                    <h2>Annotate dataset</h2>
                    {errorDIV}
                    {formDIV}
                    {progressDIV}
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
