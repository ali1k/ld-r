import React from 'react';
import BasicIndividualInput from './BasicIndividualInput';
import BasicTextareaInput from './BasicTextareaInput';
import BasicIndividualDetailEdit from './BasicIndividualDetailEdit';

class IndividualDataEdit extends React.Component {
    handleDataEdit(value){
        this.props.onDataEdit(value);
    }
    handleDetailDataEdit(detailData){
        this.props.onDetailDataEdit(detailData);
    }
    render() {
        let editor, extendedEditor, output;
        if(this.props.spec.extendedViewData){
            //go to extended edit
            switch(this.props.config? (this.props.config.extendedEditor? this.props.config.extendedEditor[0]:'') : ''){
                case 'BasicIndividualDetailEdit':
                    extendedEditor = <BasicIndividualDetailEdit spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)}/>;
                break;
                default:
                    extendedEditor = <BasicIndividualDetailEdit spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)}/>;
            }
            output = extendedEditor;
        }else{
            //go to normal edit
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
            output = editor;
        }
        return (
            <div className="ui secondary segment">
                {output}
            </div>
        );
    }
}

export default IndividualDataEdit;
