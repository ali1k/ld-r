import React from 'react';
import IndividualDataEdit from './IndividualDataEdit';

class BasicAggregateInput extends React.Component {
    handleDataEdit(value){

    }
    render() {
        let self = this;
        let list = this.props.spec.instances.map(function(node, index) {
            if(!node){
                return undefined; // stop processing this iteration
            }
            return (
                <IndividualDataEdit key={index} spec={node} config={self.props.config} graphName={self.props.graphName} onDataEdit={self.handleDataEdit.bind(this)}/>
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
