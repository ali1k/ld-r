import React from 'react';
import PropertyHeader from './PropertyHeader';
import ObjectReactor from '../reactors/ObjectReactor';

class IndividualProperty extends React.Component {
    constructor(props) {
        super(props);
        this.state = {inNewValueMode: false, showNewInsert: true};
    }
    handleNewIndividualObject(){
        this.setState({inNewValueMode: 1});
    }
    handleCancelNewIndividualObject(){
        this.setState({inNewValueMode: 0});
    }
    //considers 0 elements
    simulateDefaultValue (){
        let value, instances = this.props.spec.instances;
        if(this.props.config && this.props.config.defaultValue){
            value = this.props.config.defaultValue;
        }else{
            value = 'defaultValue';
        }
        let t;
        instances.forEach(function(v, i) {
            if(instances[i]){
                t = {'isDefault': 1, 'value': value, 'valueType': instances[i].valueType, 'dataType': instances[i].dataType};
                return t;
            }
        });
        return t;
    }
    //it is used by AggregateObjectReactor to disable new mode on edit mode
    controlNewInsert (control){
        this.setState({showNewInsert: control});
    }
    render() {
        let self = this;
        let newValueDIV, defaultValueDIV, propLabel;
        if(this.props.config && this.props.config.allowNewValue && !this.props.readOnly){
            propLabel = this.props.config.label ? this.props.config.label : this.props.spec.property;
            if(this.state.inNewValueMode){
                defaultValueDIV = <ObjectReactor isNewValue={true} inEditMode={true} key="defaultValue" spec={this.simulateDefaultValue()} config={this.props.config} graphName={this.props.graphName} resource={this.props.resource} property={this.props.property} readOnly={false} onCreateIndividualObject={this.props.onCreateIndividualObject.bind(this)}/>;
                newValueDIV = <div className="ui list">
                                        <div className="item">
                                            <div onClick={this.handleCancelNewIndividualObject.bind(this)} className="medium ui basic icon labeled button">
                                                <i className="cancel square large red icon "></i> &nbsp; Cancel adding new <strong> {propLabel} </strong>
                                            </div>
                                        </div>
                               </div>;
            }else{
                defaultValueDIV = '';
                newValueDIV = <div className="ui list">
                                    <div className="item">
                                        <div onClick={this.handleNewIndividualObject.bind(this)} className="medium ui basic icon labeled button">
                                            <i className="plus square large blue icon "></i> &nbsp; New <strong> {propLabel} </strong>
                                        </div>
                                    </div>
                                    <br/>
                              </div>;
            }
        }
        return (
            <div ref='individualProperty'>
                <div className="ui horizontal list">
                    <div className="item">
                        <PropertyHeader spec={this.props.spec} config={this.props.config} size="3" />
                    </div>
                </div>
                <div className="ui dividing header"></div>
                <div className="property-objects">
                    <ObjectReactor enableAuthentication={this.props.enableAuthentication} readOnly={this.props.readOnly} inEditMode={this.props.inEditMode} graphName={this.props.graphName} resource={this.props.resource} property={this.props.property} propertyPath={this.props.propertyPath} spec={this.props.spec} config={this.props.config} onCreateIndividualObject={this.props.onCreateIndividualObject.bind(this)} onDeleteIndividualObject={this.props.onDeleteIndividualObject.bind(this)} onUpdateIndividualObject={this.props.onUpdateIndividualObject.bind(this)} onDetailCreateIndividualObject={this.props.onDetailCreateIndividualObject.bind(this)} onDetailUpdateIndividualObject={this.props.onDetailUpdateIndividualObject.bind(this)} onUpdateAggObject={this.props.onUpdateAggObject.bind(this)} onDeleteAggObject={this.props.onDeleteAggObject.bind(this)} onControlNewInsert={this.controlNewInsert.bind(this)}/>
                </div>
                {defaultValueDIV}
                {(this.state.showNewInsert ? newValueDIV : '')}
            </div>
        );
    }
}
export default IndividualProperty;
