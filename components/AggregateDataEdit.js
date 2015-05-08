import React from 'react';
import BasicAggregateInput from './BasicAggregateInput';

class AggregateDataEdit extends React.Component {
    render() {
        let editor;
        switch(this.props.config? (this.props.config.editor? this.props.config.editor[0]:'') : ''){
            case 'BasicAggregateEdit':
                editor = <BasicAggregateInput spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                editor = <BasicAggregateInput spec={this.props.spec} config={this.props.config}/>;
        }
        return (
            <div className="ui" ref="aggregateDataEdit">
                {editor}
            </div>
        );
    }
}

export default AggregateDataEdit;
