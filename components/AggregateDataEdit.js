import React from 'react';
import BasicAggregateInput from './BasicAggregateInput';

class AggregateDataEdit extends React.Component {
    handleAggDataEdit(changes){
        this.props.onAggDataEdit(changes);
    }
    render() {
        let editor, editorConfig = '';
        if(this.props.config){
            if(this.props.config.editor){
                editorConfig = this.props.config.editor[0];
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
            <div className="ui" ref="aggregateDataEdit">
                {editor}
            </div>
        );
    }
}

export default AggregateDataEdit;
