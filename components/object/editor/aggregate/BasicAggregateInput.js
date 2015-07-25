import React from 'react';
import ObjectIEditor from '../../ObjectIEditor';
import BasicCheckbox from '../individual/BasicCheckbox';

class BasicAggregateInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleDataEdit(key, oldValue, valueType, dataType, newValue){
        this.state[key] = {oldValue: oldValue, newValue: newValue, valueType: valueType, dataType: dataType};
        this.props.onAggDataEdit(this.state);
    }
    handleEnterPress(){

    }
    checkBox(id, status) {
        this.state[id].checked = status;
        this.props.onAggDataEdit(this.state);
    }
    render() {
        let self = this;
        let list = this.props.spec.instances.map(function(node, index) {
            if(!node){
                return undefined; // stop processing this iteration
            }
            return (
                <div key={index} className="ui form grid"> <div className="twelve wide column field"> <ObjectIEditor spec={node} config={self.props.config} graphName={self.props.graphName} onDataEdit={self.handleDataEdit.bind(self, index, node.value, node.valueType, node.dataType)} onEnterPress={self.handleEnterPress.bind(this)}/> </div> <div className="two wide column field"> <BasicCheckbox onToggle={self.checkBox.bind(self, index)}/> </div> </div>
            );
        });
        return (
            <div className="ui list" ref="basicAggregateInput">
                <div className="item">
                    {list}
                </div>
            </div>
        );
    }
}

export default BasicAggregateInput;
