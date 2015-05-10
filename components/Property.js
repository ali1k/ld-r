import React from 'react';
import {provideContext} from 'fluxible/addons';
import PropertyHeader from './PropertyHeader';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateObjectReactor from './AggregateObjectReactor';
import deleteIndividualObject from '../actions/deleteIndividualObject';
import createIndividualObject from '../actions/createIndividualObject';
import updateIndividualObject from '../actions/updateIndividualObject';
import updateIndividualObjectDetail from '../actions/updateIndividualObjectDetail';
import updateAggObject from '../actions/updateAggObject';
import deleteAggObject from '../actions/deleteAggObject';

class Property extends React.Component {
    constructor(props) {
        super(props);
        this.state = {inNewValueMode: false, showNewInsert: true};
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
    //it is used by AggregateObjectReactor to disable new mode on edit mode
    controlNewInsert (control){
        this.setState({showNewInsert: control});
    }
    handleDeleteIndividualObject(propertyURI, objectValue, valueType){
        if(!objectValue){
            return null;
        }
        this.context.executeAction(deleteIndividualObject, {
          category: (this.props.config? (this.props.config.category? this.props.config.category[0]: ''): ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: propertyURI,
          objectValue: objectValue,
          valueType: valueType
        });
    }
    handleDeleteAggObject(propertyURI, changes){
        if(!changes.length){
            return null;
        }
        this.context.executeAction(deleteAggObject, {
          category: (this.props.config? (this.props.config.category? this.props.config.category[0]: ''): ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: propertyURI,
          changes: changes
        });
    }
    handleCreateIndividualObject(propertyURI, objectValue, valueType){
        if(!objectValue){
            return null;
        }
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
        if(!newObjectValue){
            return null;
        }
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
    handleUpdateAggObject(propertyURI, changes){
        if(!changes.length){
            return null;
        }
        this.context.executeAction(updateAggObject, {
          category: (this.props.config? (this.props.config.category? this.props.config.category[0]: ''): ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: propertyURI,
          changes: changes
        });
    }
    handleDetailUpdateIndividualObject(propertyURI, oldObjectValue, newObjectValue, valueType, detailData){
        this.context.executeAction(updateIndividualObjectDetail, {
          category: (this.props.config? (this.props.config.category? this.props.config.category[0]: ''): ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: propertyURI,
          oldObjectValue: oldObjectValue,
          newObjectValue: newObjectValue,
          valueType: valueType,
          detailData: detailData
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
        let newValueDIV, defaultValueDIV, propLabel;
        if(this.props.config && this.props.config.allowNewValue && !this.props.readOnly){
            propLabel = this.props.config.label? this.props.config.label: this.props.spec.property;
            if(this.state.inNewValueMode){
                defaultValueDIV = <IndividualObjectReactor isNewValue={true} inEditMode={true} key="defaultValue" spec={this.simulateDefaultValue(this.props.spec.instances, 'default')} config={this.props.config} graphName={this.props.graphName} resource={this.props.resource} onCreate={this.handleCreateIndividualObject.bind(this, this.props.spec.propertyURI)}/>;
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
                                            <i className="plus square large blue icon "></i> &nbsp; Add another <strong> {propLabel} </strong>
                                        </div>
                                    </div>

                              </div>;
            }
        }
        let list, reactorTypeConfig = '';
        if(this.props.config){
            if(this.props.config.reactorType){
                reactorTypeConfig = this.props.config.reactorType[0];
            }
        }
        //check if it is the only value of a property -> used to hide delete button
        let isOnlyChild = (this.calculateValueCount(this.props.spec.instances) === 1);
        //dispatch to the right reactor
        switch(reactorTypeConfig){
            case 'IndividualObjectReactor':
                list = this.props.spec.instances.map(function(node, index) {
                    if(!node){
                        return undefined; // stop processing this iteration
                    }
                    return (
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self, self.props.spec.propertyURI)} onUpdate={self.handleUpdateIndividualObject.bind(self, self.props.spec.propertyURI)} onDetailUpdate={self.handleDetailUpdateIndividualObject.bind(self, self.props.spec.propertyURI)}/>
                    );
                });
            break;
            case 'AggregateObjectReactor':
                list = <AggregateObjectReactor isOnlyChild={isOnlyChild} readOnly={self.props.readOnly} spec={this.props.spec} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} onIndividualDelete={self.handleDeleteIndividualObject.bind(self, self.props.spec.propertyURI)} onIndividualUpdate={self.handleUpdateIndividualObject.bind(self, self.props.spec.propertyURI)} onIndividualDetailUpdate={self.handleDetailUpdateIndividualObject.bind(self, self.props.spec.propertyURI)} onUpdate={self.handleUpdateAggObject.bind(self, self.props.spec.propertyURI)} onDelete={self.handleDeleteAggObject.bind(self, self.props.spec.propertyURI)} controlNewInsert={self.controlNewInsert.bind(self)}/>;
            break;
            default:
                list = this.props.spec.instances.map(function(node, index) {
                    if(!node){
                        return undefined; // stop processing this iteration
                    }
                    return (
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self, self.props.spec.propertyURI)} onUpdate={self.handleUpdateIndividualObject.bind(self, self.props.spec.propertyURI)} onDetailUpdate={self.handleDetailUpdateIndividualObject.bind(self, self.props.spec.propertyURI)}/>
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
                {(this.state.showNewInsert? newValueDIV: '')}
            </div>
        );
    }
}
Property.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
export default Property;
