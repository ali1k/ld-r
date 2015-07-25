import React from 'react';
import {provideContext} from 'fluxible/addons';
import deleteIndividualObject from '../../actions/deleteIndividualObject';
import createIndividualObject from '../../actions/createIndividualObject';
import createIndividualObjectDetail from '../../actions/createIndividualObjectDetail';
import updateIndividualObject from '../../actions/updateIndividualObject';
import updateIndividualObjectDetail from '../../actions/updateIndividualObjectDetail';
import updateAggObject from '../../actions/updateAggObject';
import deleteAggObject from '../../actions/deleteAggObject';
import IndividualProperty from '../property/IndividualProperty';

class PropertyReactor extends React.Component {
    constructor(props) {
        super(props);
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
    //removes properties from an object
    configMinus(config, props) {
        let o = {};
        for(let p in config) {
            if(props.indexOf(p) === -1){
                o [p] = config [p];
            }
        }
        return o;
    }
    render() {
        let propertyReactorType, propertyReactor;
        if(this.props.config){
            if(!this.props.config.propertyReactor){
                propertyReactorType = 'IndividualProperty';
            }else{
                propertyReactorType = this.props.config.propertyReactor[0];
            }
        }
        if(propertyReactorType){
            switch(propertyReactorType){
                case 'IndividualProperty':
                    propertyReactor = <IndividualProperty spec={this.props.spec} enableAuthentication={this.props.enableAuthentication} readOnly={this.props.readOnly} graphName={this.props.graphName} resource={this.props.resource} property={this.props.property} propertyPath= {this.props.propertyPath} config={this.configMinus(this.props.config, ['propertyReactor'])} onCreateIndividualObject={this.handleCreateIndividualObject.bind(this)} onDeleteIndividualObject={this.handleDeleteIndividualObject.bind(this)} onUpdateIndividualObject={this.handleUpdateIndividualObject.bind(this)} onDetailCreateIndividualObject={this.handleDetailCreateIndividualObject.bind(this)} onDetailUpdateIndividualObject={this.handleDetailUpdateIndividualObject.bind(this)} onUpdateAggObject={this.handleUpdateAggObject.bind(this)} onDeleteAggObject={this.handleDeleteAggObject.bind(this)}/>;
                break;
                default:
                    propertyReactor = <IndividualProperty spec={this.props.spec} enableAuthentication={this.props.enableAuthentication} readOnly={this.props.readOnly} graphName={this.props.graphName} resource={this.props.resource} property={this.props.property} propertyPath= {this.props.propertyPath} config={this.configMinus(this.props.config, ['propertyReactor'])} onCreateIndividualObject={this.handleCreateIndividualObject.bind(this)} onDeleteIndividualObject={this.handleDeleteIndividualObject.bind(this)} onUpdateIndividualObject={this.handleUpdateIndividualObject.bind(this)} onDetailCreateIndividualObject={this.handleDetailCreateIndividualObject.bind(this)} onDetailUpdateIndividualObject={this.handleDetailUpdateIndividualObject.bind(this)} onUpdateAggObject={this.handleUpdateAggObject.bind(this)} onDeleteAggObject={this.handleDeleteAggObject.bind(this)}/>;
            }
        }
        return (
            <div ref="propertyReactor" className="property item">
                {propertyReactor}
            </div>
        );
    }
}
PropertyReactor.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
export default PropertyReactor;
