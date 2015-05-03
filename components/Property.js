import React from 'react';

class Property extends React.Component {
    render() {
        return (
            <div className="ui" ref="property">
                {this.props.spec.property}
            </div>
        );
    }
}

export default Property;
