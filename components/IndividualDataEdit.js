import React from 'react';
import BasicIndividualInput from './BasicIndividualInput';
import BasicTextareaInput from './BasicTextareaInput';

class IndividualDataEdit extends React.Component {
    handleDataEdit(value){
        this.props.onDataEdit(value);
    }
    render() {
        let editor;
        switch(this.props.config? (this.props.config.editor? this.props.config.editor[0]:'') : ''){
            case 'BasicIndividualInput':
                editor = <BasicIndividualInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)}/>;
            break;
            case 'BasicTextareaInput':
                editor = <BasicTextareaInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)}/>;
            break;
            default:
                editor = <BasicIndividualInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)}/>;
        }
        return (
            <div className="ui">
                {editor}
            </div>
        );
    }
}

export default IndividualDataEdit;
