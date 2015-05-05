import React from 'react';
import {provideContext} from 'fluxible/addons';
import PropertyHeader from './PropertyHeader';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateObjectReactor from './AggregateObjectReactor';
import deleteIndividualObject from '../actions/deleteIndividualObject';
import createIndividualObject from '../actions/createIndividualObject';
import updateIndividualObject from '../actions/updateIndividualObject';

class Property extends React.Component {
    constructor(props) {
        super(props);
        this.state = {inNewValueMode: 0};
    }
    componentDidMount() {
        let currentComp = this.refs.property.getDOMNode();
    }
    //considers 0 elements
    calculateValueCount (instances){
        let count = 0;
        instances.forEach(function(v, i) {
            if(instances[i]){
                count++;
            }
        });
        return count;
    }
    //considers 0 elements
    simulateDefaultValue (instances, value){
        let t;
        instances.forEach(function(v, i) {
            if(instances[i]){
                t = {'isDefault': 1, 'value': value, 'valueType': instances[i].valueType, 'dataType': instances[i].dataType};
                return t;
            }
        });
        return t;
    }
    handleDeleteIndividualObject(propertyURI, objectValue, valueType){
        this.context.executeAction(deleteIndividualObject, {
          category: (this.props.config? (this.props.config.category? this.props.config.category[0]: ''): ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: propertyURI,
          objectValue: objectValue,
          valueType: valueType
        });
    }
    handleCreateIndividualObject(propertyURI, objectValue, valueType){
        this.context.executeAction(createIndividualObject, {
          category: (this.props.config? (this.props.config.category? this.props.config.category[0]: ''): ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: propertyURI,
          objectValue: objectValue,
          valueType: valueType
        });
        this.setState({inNewValueMode: 0});
    }
    handleUpdateIndividualObject(propertyURI, oldObjectValue, newObjectValue, valueType){
        this.context.executeAction(updateIndividualObject, {
          category: (this.props.config? (this.props.config.category? this.props.config.category[0]: ''): ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: propertyURI,
          oldObjectValue: oldObjectValue,
          newObjectValue: newObjectValue,
          valueType: valueType
        });
    }
    handleNewIndividualObject(){
        this.setState({inNewValueMode: 1});
    }
    handleCancelNewIndividualObject(){
        this.setState({inNewValueMode: 0});
    }
    render() {
        let self = this;
        let newValueDIV, defaultValueDIV;
        if(this.props.config && this.props.config.allowNewValue && !this.props.readOnly){
            if(this.state.inNewValueMode){
                defaultValueDIV = <IndividualObjectReactor isNewValue="1" inEditMode="1" key="defaultValue" spec={this.simulateDefaultValue(this.props.spec.instances, 'default')} config={this.props.config} graphName={this.props.graphName} resource={this.props.resource} onCreate={this.handleCreateIndividualObject.bind(this, this.props.spec.propertyURI)}/>;
                newValueDIV = <div className="ui list">
                                        <div className="item">
                                            <div onClick={this.handleCancelNewIndividualObject.bind(this)} className="medium ui basic icon labeled button">
                                                <i className="cancel square large red icon "></i> &nbsp; Cancel adding new <strong> {this.props.spec.property} </strong>
                                            </div>
                                        </div>

                               </div>;
            }else{
                defaultValueDIV = '';
                newValueDIV = <div className="ui list">
                                    <div className="item">
                                        <div onClick={this.handleNewIndividualObject.bind(this)} className="medium ui basic icon labeled button">
                                            <i className="plus square large blue icon "></i> &nbsp; Add another <strong> {this.props.spec.property} </strong>
                                        </div>
                                    </div>

                              </div>;
            }
        }
        let list;
        //dispatch to the right reactor
        switch(this.props.config? (this.props.config.reactorType? this.props.config.reactorType[0]:'') : ''){
            case 'IndividualObjectReactor':
                //check if it is the only value of a property -> used to hide delete button
                let isOnlyChild = (this.calculateValueCount(this.props.spec.instances) === 1);
                list = this.props.spec.instances.map(function(node, index) {
                    if(!node){
                        return undefined; // stop processing this iteration
                    }
                    return (
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self, self.props.spec.propertyURI)} onUpdate={self.handleUpdateIndividualObject.bind(self, self.props.spec.propertyURI)}/>
                    );
                });
            break;
            case 'AggregateObjectReactor':
                list = <AggregateObjectReactor readOnly={self.props.readOnly} spec={this.props.spec} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource}/>;
            break;
            default:
                let isOnlyChild = (this.calculateValueCount(this.props.spec.instances) === 1);
                list = this.props.spec.instances.map(function(node, index) {
                    if(!node){
                        return undefined; // stop processing this iteration
                    }
                    return (
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self, self.props.spec.propertyURI)} onUpdate={self.handleUpdateIndividualObject.bind(self, self.props.spec.propertyURI)}/>
                    );
                });
        }
        return (
            <div className="property item" ref='property'>
                <div className="ui horizontal list">
                    <div className="item">
                        <PropertyHeader spec={this.props.spec} config={this.props.config} size="3" />
                    </div>
                </div>
                <div className="ui dividing header"></div>
                <div className="property-objects">
                    {list}
                </div>
                {defaultValueDIV}
                {newValueDIV}
            </div>
        );
    }
}
Property.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
export default Property;
