import React from 'react';
import BasicIndividualInput from './BasicIndividualInput';

class IndividualDataEdit extends React.Component {
    render() {
        let editor;
        switch(this.props.config? (this.props.config.editor? this.props.config.editor[0]:'') : ''){
            case 'BasicIndividualInput':
                editor = <BasicIndividualInput spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                editor = <BasicIndividualInput spec={this.props.spec} config={this.props.config}/>;
        }
        return (
            <div className="ui">
                {editor}
            </div>
        );
    }
}

export default IndividualDataEdit;
