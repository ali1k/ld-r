import React from 'react';
import {provideContext} from 'fluxible/addons';
import PropertyHeader from './PropertyHeader';
import {enableAuthentication} from '../configs/reactor';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateObjectReactor from './AggregateObjectReactor';
import deleteIndividualObject from '../actions/deleteIndividualObject';
import createIndividualObject from '../actions/createIndividualObject';
import createIndividualObjectDetail from '../actions/createIndividualObjectDetail';
import updateIndividualObject from '../actions/updateIndividualObject';
import updateIndividualObjectDetail from '../actions/updateIndividualObjectDetail';
import updateAggObject from '../actions/updateAggObject';
import deleteAggObject from '../actions/deleteAggObject';

class IndividualPropertyReactor extends React.Component {
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
    handleDeleteIndividualObject(objectValue, valueType, dataType){
        if(!objectValue){
            return null;
        }
        this.context.executeAction(deleteIndividualObject, {
          category: (this.props.config ? (this.props.config.category ? this.props.config.category[0] : '') : ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyPath: this.props.propertyPath,
          propertyURI: this.props.spec.propertyURI,
          objectValue: objectValue,
          valueType: valueType,
          dataType: dataType
        });
    }
    handleDeleteAggObject(changes){
        if(!changes.length){
            return null;
        }
        this.context.executeAction(deleteAggObject, {
          category: (this.props.config ? (this.props.config.category ? this.props.config.category[0] : '') : ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyPath: this.props.propertyPath,
          propertyURI: this.props.spec.propertyURI,
          changes: changes
        });
    }
    handleCreateIndividualObject(objectValue, valueType, dataType){
        if(!objectValue){
            return null;
        }
        this.context.executeAction(createIndividualObject, {
          category: (this.props.config ? (this.props.config.category ? this.props.config.category[0] : '') : ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyPath: this.props.propertyPath,
          propertyURI: this.props.spec.propertyURI,
          objectValue: objectValue,
          valueType: valueType,
          dataType: dataType
        });
        this.setState({inNewValueMode: 0});
    }
    handleUpdateIndividualObject(oldObjectValue, newObjectValue, valueType, dataType){
        if(!newObjectValue){
            return null;
        }
        this.context.executeAction(updateIndividualObject, {
          category: (this.props.config ? (this.props.config.category ? this.props.config.category[0] : '') : ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyPath: this.props.propertyPath,
          propertyURI: this.props.spec.propertyURI,
          oldObjectValue: oldObjectValue,
          newObjectValue: newObjectValue,
          valueType: valueType,
          dataType: dataType
        });
    }
    handleUpdateAggObject(changes){
        if(!changes.length){
            return null;
        }
        this.context.executeAction(updateAggObject, {
          category: (this.props.config ? (this.props.config.category ? this.props.config.category[0] : '') : ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyPath: this.props.propertyPath,
          propertyURI: this.props.spec.propertyURI,
          changes: changes
        });
    }
    handleDetailCreateIndividualObject(oldObjectValue, newObjectValue, valueType, dataType, detailData){
        this.context.executeAction(createIndividualObjectDetail, {
          category: (this.props.config ? (this.props.config.category ? this.props.config.category[0] : '') : ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyPath: this.props.propertyPath,
          propertyURI: this.props.spec.propertyURI,
          oldObjectValue: oldObjectValue,
          newObjectValue: newObjectValue,
          valueType: valueType,
          dataType: dataType,
          detailData: detailData
        });
    }
    handleDetailUpdateIndividualObject(oldObjectValue, newObjectValue, valueType, dataType, detailData){
        this.context.executeAction(updateIndividualObjectDetail, {
          category: (this.props.config ? (this.props.config.category ? this.props.config.category[0] : '') : ''),
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyPath: this.props.propertyPath,
          propertyURI: this.props.spec.propertyURI,
          oldObjectValue: oldObjectValue,
          newObjectValue: newObjectValue,
          valueType: valueType,
          dataType: dataType,
          detailData: detailData
        });
    }
    handleNewIndividualObject(){
        this.setState({inNewValueMode: 1});
    }
    handleCancelNewIndividualObject(){
        this.setState({inNewValueMode: 0});
    }
    includesProperty(list, resource, property) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource && el.p === property){
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource, property) {
        if(enableAuthentication) {
            if(user){
                if(parseInt(user.isSuperUser)){
                    return {access: true, type: 'full'};
                }else{
                    if(graph && user.editorOfGraph.indexOf(graph) !== -1){
                        return {access: true, type: 'full'};
                    }else{
                        if(resource && user.editorOfResource.indexOf(resource) !== -1){
                            return {access: true, type: 'full'};
                        }else{
                            if(property && this.includesProperty(user.editorOfProperty, resource, property)){
                                return {access: true, type: 'partial'};
                            }else{
                                return {access: false};
                            }
                        }
                    }
                }
            }else{
                return {access: false};
            }
        }else{
            return {access: true, type: 'full'};
        }
    }
    render() {
        let user = this.context.getUser();
        let self = this;
        let newValueDIV, defaultValueDIV, propLabel;
        if(this.props.config && this.props.config.allowNewValue && !this.props.readOnly){
            propLabel = this.props.config.label ? this.props.config.label : this.props.spec.property;
            if(this.state.inNewValueMode){
                defaultValueDIV = <IndividualObjectReactor isNewValue={true} inEditMode={true} key="defaultValue" spec={this.simulateDefaultValue(this.props.spec.instances, 'default')} config={this.props.config} graphName={this.props.graphName} resource={this.props.resource} onCreate={this.handleCreateIndividualObject.bind(this)}/>;
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
        let list, objectReactorTypeConfig = '';
        if(this.props.config){
            if(this.props.config.objectReactorType){
                objectReactorTypeConfig = this.props.config.objectReactorType[0];
            }
        }
        //check if it is the only value of a property -> used to hide delete button
        let isOnlyChild = (this.calculateValueCount(this.props.spec.instances) === 1);
        let accessLevel, readOnly;
        //dispatch to the right reactor
        switch(objectReactorTypeConfig){
            case 'IndividualObjectReactor':
                list = this.props.spec.instances.map(function(node, index) {
                    if(!node){
                        return undefined; // stop processing this iteration
                    }
                    //check access level for details
                    readOnly = self.props.readOnly;
                    if(node.extended){
                        accessLevel = self.checkAccess(user, self.props.graphName, self.props.resource, '');
                        if(!accessLevel.access){
                            readOnly = true;
                        }
                    }
                    return (
                        <IndividualObjectReactor inEditMode={self.props.inEditMode} key={index} readOnly={readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self)} onUpdate={self.handleUpdateIndividualObject.bind(self)} onDetailCreate={self.handleDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.handleDetailUpdateIndividualObject.bind(self)}/>
                    );
                });
            break;
            case 'AggregateObjectReactor':
                list = <AggregateObjectReactor inEditMode={self.props.inEditMode} isOnlyChild={isOnlyChild} readOnly={self.props.readOnly} spec={this.props.spec} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} onIndividualDelete={self.handleDeleteIndividualObject.bind(self)} onIndividualUpdate={self.handleUpdateIndividualObject.bind(self)} onDetailCreate={self.handleDetailCreateIndividualObject.bind(self)} onIndividualDetailUpdate={self.handleDetailUpdateIndividualObject.bind(self)} onUpdate={self.handleUpdateAggObject.bind(self)} onDelete={self.handleDeleteAggObject.bind(self)} controlNewInsert={self.controlNewInsert.bind(self)}/>;
            break;
            default:
                list = this.props.spec.instances.map(function(node, index) {
                    if(!node){
                        return undefined; // stop processing this iteration
                    }
                    //check access level for details
                    readOnly = self.props.readOnly;
                    if(node.extended){
                        accessLevel = self.checkAccess(user, self.props.graphName, node.value, '');
                        if(!accessLevel.access){
                            readOnly = true;
                        }
                    }
                    return (
                        <IndividualObjectReactor inEditMode={self.props.inEditMode} key={index} readOnly={readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self)} onUpdate={self.handleUpdateIndividualObject.bind(self)} onDetailCreate={self.handleDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.handleDetailUpdateIndividualObject.bind(self)}/>
                    );
                });
        }
        return (
            <div className="property item" ref='individualPropertyReactor'>
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
                {(this.state.showNewInsert ? newValueDIV : '')}
            </div>
        );
    }
}
IndividualPropertyReactor.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
export default IndividualPropertyReactor;
