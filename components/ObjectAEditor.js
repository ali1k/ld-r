import React from 'react';
import BasicAggregateInput from './BasicAggregateInput';

class ObjectAEditor extends React.Component {
    handleAggDataEdit(changes){
        this.props.onAggDataEdit(changes);
    }
    render() {
        let editor, editorConfig = '';
        if(this.props.config){
            if(this.props.config.objectIEditor){
                editorConfig = this.props.config.objectIEditor[0];
            }
        }
        switch(editorConfig){
            case 'BasicAggregateEdit':
                editor = <BasicAggregateInput spec={this.props.spec} config={this.props.config} onAggDataEdit={this.handleAggDataEdit.bind(this)}/>;
            break;
            default:
                editor = <BasicAggregateInput spec={this.props.spec} config={this.props.config} onAggDataEdit={this.handleAggDataEdit.bind(this)}/>;
        }
        return (
            <div className="ui" ref="objectAEditor">
                {editor}
            </div>
        );
    }
}

export default ObjectAEditor;
