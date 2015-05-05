import React from 'react';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateObjectReactor from './AggregateObjectReactor';

class Property extends React.Component {
    componentDidMount() {
        let currentComp = this.refs.property.getDOMNode();
        //enable hints
        /*global $*/
        $(currentComp).find('.hint')
        .popup({
          hoverable: true
        });
    }
    render() {
        let self = this;
        let hintDIV, newValueDIV;
        if(this.props.config && this.props.config.hint){
            hintDIV = <a className="hint" data-content={this.props.config.hint[0]}> <i className="item circle info icon link"></i> </a>;
        }
        if(this.props.config && this.props.config.allowNewValue && !this.props.readOnly){
            newValueDIV = <div className="ui list">
                                <div className="item">
                                    <div className="medium ui basic icon labeled button">
                                        <i className="plus square large blue icon link "></i> &nbsp; Add another <strong> {this.props.spec.property} </strong>
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
                        <h3>
                            <a href={this.props.spec.propertyURI} target="_blank"> {this.props.spec.property} </a>
                            {hintDIV}
                        </h3>
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
