import React from 'react';
import {provideContext} from 'fluxible/addons';
import PropertyHeader from './PropertyHeader';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateObjectReactor from './AggregateObjectReactor';
import deleteIndividualObject from '../actions/deleteIndividualObject';

class Property extends React.Component {
    componentDidMount() {
        let currentComp = this.refs.property.getDOMNode();
    }
    //considers 0 elements
    calculateValueCount (arr){
        var count = 0;
        arr.forEach(function(v, i) {
            if(arr[i]){
                count++;
            }
        });
        return count;
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
    render() {
        let self = this;
        let newValueDIV;
        if(this.props.config && this.props.config.allowNewValue && !this.props.readOnly){
            newValueDIV = <div className="ui list">
                                <div className="item">
                                    <div className="medium ui basic icon labeled circular button">
                                        <i className="plus square large blue icon "></i> &nbsp; Add another <strong> {this.props.spec.property} </strong>
                                    </div>
                                </div>

                          </div>;
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
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self, self.props.spec.propertyURI)}/>
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
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} isOnlyChild={isOnlyChild} onDelete={self.handleDeleteIndividualObject.bind(self, self.props.spec.propertyURI)}/>
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
                {newValueDIV}
            </div>
        );
    }
}
Property.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
export default Property;
