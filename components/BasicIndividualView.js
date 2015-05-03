import React from 'react';

class BasicIndividualView extends React.Component {
    render() {
        return (
            <div className="ui">
                {this.props.spec.value}
            </div>
        );
    }
}

export default BasicIndividualView;
