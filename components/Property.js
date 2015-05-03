import React from 'react';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateObjectReactor from './AggregateObjectReactor';

class Property extends React.Component {
    render() {
        let objectReactor;
        //dispatch to the right reactor
        switch(this.props.config? (this.props.reactorType? this.props.config.reactorType[0]:'') : ''){
            case 'IndividualObjectReactor':
                objectReactor = <IndividualObjectReactor spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'AggregateObjectReactor':
                objectReactor = <AggregateObjectReactor spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                objectReactor = <IndividualObjectReactor spec={this.props.spec} config={this.props.config}/>;
        }
        return (
            <div className="property item">
                <div className="ui horizontal list">
                    <div className="item">
                        <h3>
                            {this.props.spec.property}
                        </h3>
                    </div>
                    <i className="item circle info icon link"></i>
                </div>
                <div className="ui dividing header"></div>
                <div className="property-objects">
                    {objectReactor}
                </div>
            </div>
        );
    }
}

export default Property;
