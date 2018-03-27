import React from 'react';
import PropTypes from 'prop-types';
import {provideContext} from 'fluxible/addons';
import deleteIndividualObject from '../../actions/deleteIndividualObject';
import deleteProperty from '../../actions/deleteProperty';
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
    handleDeleteProperty() {
        this.context.executeAction(deleteProperty, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
            resourceURI: this.props.resource,
            propertyPath: this.props.propertyPath,
            propertyURI: this.props.spec.propertyURI
        });
    }
    handleDeleteIndividualObject(objectValue, valueType, dataType) {
        if (!objectValue) {
            return null;
        }
        this.context.executeAction(deleteIndividualObject, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
            resourceURI: this.props.resource,
            propertyPath: this.props.propertyPath,
            propertyURI: this.props.spec.propertyURI,
            objectValue: objectValue,
            valueType: valueType,
            dataType: dataType
        });
    }
    handleDeleteAggObject(changes) {
        if (!changes.length) {
            return null;
        }
        this.context.executeAction(deleteAggObject, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
            resourceURI: this.props.resource,
            propertyPath: this.props.propertyPath,
            propertyURI: this.props.spec.propertyURI,
            changes: changes
        });
    }
    handleCreateIndividualObject(objectValue, valueType, dataType) {
        if (!objectValue) {
            return null;
        }
        this.context.executeAction(createIndividualObject, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
            resourceURI: this.props.resource,
            propertyPath: this.props.propertyPath,
            propertyURI: this.props.spec.propertyURI,
            objectValue: objectValue,
            valueType: valueType,
            dataType: dataType
        });
        this.setState({inNewValueMode: 0});
    }
    handleUpdateIndividualObject(oldObjectValue, newObjectValue, valueType, dataType) {
        if (!newObjectValue) {
            return null;
        }
        this.context.executeAction(updateIndividualObject, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
            resourceURI: this.props.resource,
            propertyPath: this.props.propertyPath,
            propertyURI: this.props.spec.propertyURI,
            oldObjectValue: oldObjectValue,
            newObjectValue: newObjectValue,
            valueType: valueType,
            dataType: dataType
        });
    }
    handleUpdateAggObject(changes) {
        if (!changes.length) {
            return null;
        }
        this.context.executeAction(updateAggObject, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
            resourceURI: this.props.resource,
            propertyPath: this.props.propertyPath,
            propertyURI: this.props.spec.propertyURI,
            changes: changes
        });
    }
    handleDetailCreateIndividualObject(oldObjectValue, newObjectValue, valueType, dataType, detailData) {
        this.context.executeAction(createIndividualObjectDetail, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
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
    handleDetailUpdateIndividualObject(oldObjectValue, newObjectValue, valueType, dataType, detailData) {
        this.context.executeAction(updateIndividualObjectDetail, {
            category: (this.props.config
                ? (this.props.config.category
                    ? this.props.config.category[0]
                    : '')
                : ''),
            dataset: this.props.datasetURI,
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
        for (let p in config) {
            if (props.indexOf(p) === -1) {
                o[p] = config[p];
            }
        }
        return o;
    }
    render() {
        let propertyReactorType,
            propertyReactor;
        if (this.props.config) {
            if (!this.props.config.propertyReactor) {
                propertyReactorType = 'IndividualProperty';
            } else {
                propertyReactorType = this.props.config.propertyReactor[0];
            }
        }
        let propConfig = this.configMinus(this.props.config, ['propertyReactor']);
        if (propertyReactorType) {
            switch (propertyReactorType) {
                case 'IndividualProperty':
                    propertyReactor = <IndividualProperty hidePropertyName={this.props.hidePropertyName} spec={this.props.spec} enableAuthentication={this.props.enableAuthentication} readOnly={this.props.readOnly} datasetURI={this.props.datasetURI} resource={this.props.resource} property={this.props.property} propertyPath={this.props.propertyPath} config={propConfig} onCreateIndividualObject={this.handleCreateIndividualObject.bind(this)} onDeleteIndividualObject={this.handleDeleteIndividualObject.bind(this)} onUpdateIndividualObject={this.handleUpdateIndividualObject.bind(this)} onDetailCreateIndividualObject={this.handleDetailCreateIndividualObject.bind(this)} onDetailUpdateIndividualObject={this.handleDetailUpdateIndividualObject.bind(this)} onUpdateAggObject={this.handleUpdateAggObject.bind(this)} onDeleteAggObject={this.handleDeleteAggObject.bind(this)}/>;
                    break;
                default:
                    propertyReactor = <IndividualProperty hidePropertyName={this.props.hidePropertyName} spec={this.props.spec} enableAuthentication={this.props.enableAuthentication} readOnly={this.props.readOnly} datasetURI={this.props.datasetURI} resource={this.props.resource} property={this.props.property} propertyPath={this.props.propertyPath} config={propConfig} onCreateIndividualObject={this.handleCreateIndividualObject.bind(this)} onDeleteIndividualObject={this.handleDeleteIndividualObject.bind(this)} onUpdateIndividualObject={this.handleUpdateIndividualObject.bind(this)} onDetailCreateIndividualObject={this.handleDetailCreateIndividualObject.bind(this)} onDetailUpdateIndividualObject={this.handleDetailUpdateIndividualObject.bind(this)} onUpdateAggObject={this.handleUpdateAggObject.bind(this)} onDeleteAggObject={this.handleDeleteAggObject.bind(this)}/>;
            }
        }
        let propDeleteDIV = '';
        if(propConfig.allowPropertyDelete && !this.props.config.readOnly){
            propDeleteDIV = <div className="ui list">
                <div className="item">
                    <div  className="medium ui basic icon labeled button" onClick={this.handleDeleteProperty.bind(this)}>
                        <i className="trash alternate outline large red icon "></i> &nbsp; Delete <strong> {(propConfig && propConfig.label) ? propConfig.label : this.props.spec.property}</strong> property
                    </div>
                </div>
                <br/>
            </div>;
        }
        return (
            <div ref="propertyReactor" className="property item">
                <div className="content">
                    {propertyReactor}
                    {propDeleteDIV}
                </div>
            </div>
        );
    }
}
PropertyReactor.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
export default PropertyReactor;
