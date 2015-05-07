import React from 'react';
import BasicIndividualInput from './BasicIndividualInput';
import BasicTextareaInput from './BasicTextareaInput';
import BasicIndividualDetailEdit from './BasicIndividualDetailEdit';
import DBpediaInput from './DBpediaInput';
import LanguageInput from './LanguageInput';
import BasicOptionInput from './BasicOptionInput';

class IndividualDataEdit extends React.Component {
    handleDataEdit(value){
        this.props.onDataEdit(value);
    }
    handleDetailDataEdit(detailData){
        this.props.onDetailDataEdit(detailData);
    }
    handleEnterPress(){
        this.props.onEnterPress();
    }
    render() {
        let editor, extendedEditor, output;
        if(this.props.spec.extendedViewData){
            //go to extended edit
            switch(this.props.config? (this.props.config.extendedEditor? this.props.config.extendedEditor[0]:'') : ''){
                case 'BasicIndividualDetailEdit':
                    extendedEditor = <BasicIndividualDetailEdit spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)} onEnterPress={this.handleEnterPress.bind(this)}/>;
                break;
                default:
                    extendedEditor = <BasicIndividualDetailEdit spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)} onEnterPress={this.handleEnterPress.bind(this)}/>;
            }
            output = extendedEditor;
        }else{
            //go to normal edit
            switch(this.props.config? (this.props.config.editor? this.props.config.editor[0]:'') : ''){
                case 'BasicIndividualInput':
                    editor = <BasicIndividualInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} allowActionByKey="1" onEnterPress={this.handleEnterPress.bind(this)}/>;
                break;
                case 'BasicTextareaInput':
                    editor = <BasicTextareaInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)}/>;
                break;
                case 'DBpediaInput':
                    editor = <DBpediaInput asWikipedia="1" spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} allowActionByKey="1" onEnterPress={this.handleEnterPress.bind(this)}/>;
                break;
                case 'LanguageInput':
                    editor = <LanguageInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)}/>;
                break;
                case 'BasicOptionInput':
                    editor = <BasicOptionInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} allowActionByKey="1" onEnterPress={this.handleEnterPress.bind(this)}/>;
                break;
                default:
                    editor = <BasicIndividualInput spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} allowActionByKey="1" onEnterPress={this.handleEnterPress.bind(this)}/>;
            }
            output = editor;
        }
        return (
            <div className="ui" ref="individualDataEdit">
                {output}
            </div>
        );
    }
}

export default IndividualDataEdit;
