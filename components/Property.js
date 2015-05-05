import React from 'react';
import PropertyHeader from './PropertyHeader';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateObjectReactor from './AggregateObjectReactor';

class Property extends React.Component {
    componentDidMount() {
        let currentComp = this.refs.property.getDOMNode();
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
                list = this.props.spec.instances.map(function(node, index) {
                    return (
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource}/>
                    );
                });
            break;
            case 'AggregateObjectReactor':
                list = <AggregateObjectReactor readOnly={self.props.readOnly} spec={this.props.spec} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource}/>;
            break;
            default:
                list = this.props.spec.instances.map(function(node, index) {
                    return (
                        <IndividualObjectReactor key={index} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource}/>
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

export default Property;
