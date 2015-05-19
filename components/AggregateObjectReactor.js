import React from 'react';
import IndividualObjectReactor from './IndividualObjectReactor';
import AggregateDataView from './AggregateDataView';
import AggregateDataEdit from './AggregateDataEdit';

class AggregateObjectReactor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {changes: {}, inEditMode: this.props.inEditMode? 1 : 0, showDelete: false};
    }
    handleEdit(){
        //disable new mode
        this.props.controlNewInsert(false);
        this.setState({inEditMode: 1});
    }
    handleSave(){
        let changes = this.prepareUpdateAggData(this.state.changes);
        this.props.onUpdate(changes);
        this.props.controlNewInsert(true);
        this.setState({inEditMode: 0});
    }
    handleUndo(){
        this.props.controlNewInsert(true);
        this.setState({inEditMode: 0});
    }
    handleAggDataEdit(changes){
        this.setState({changes: changes});
        this.canShowDelete(changes);
    }
    handleAggDelete(){
        let changes = this.prepareDeleteAggData(this.state.changes);
        this.props.onDelete(changes);
        this.setState({inEditMode: 0});
        this.props.controlNewInsert(true);
    }
    canShowDelete(changes){
        let counter = 0;
        let total = this.props.spec.instances.length;
        for (let prop in changes) {
            if(changes[prop].checked === true){
                counter++;
            }
        }
        //does not allow deleting all items
        if(counter>0 && counter<total){
            this.setState({showDelete: true});
        }else{
            this.setState({showDelete: false});
        }
    }
    //filters unchanged data
    prepareUpdateAggData(changes){
        let cleaned = [];
        for (let prop in changes) {
            if(changes[prop].oldValue !== changes[prop].newValue){
                cleaned.push(changes[prop]);
            }
        }
        return cleaned;
    }
    //filters unchecked data
    prepareDeleteAggData(changes){
        let cleaned = [];
        for (let prop in changes) {
            if(changes[prop].checked){
                cleaned.push(changes[prop]);
            }
        }
        return cleaned;
    }
    render() {
        let isIndividual = false;
        let dataViewType, dataViewTypeConfig = '', dataEditType, dataEditTypeConfig = '', self = this;
        if(this.props.config){
            if(this.props.config.dataEditType){
                dataEditTypeConfig = this.props.config.dataEditType[0];
            }
            if(this.props.config.dataViewType){
                dataViewTypeConfig = this.props.config.dataViewType[0];
            }
        }
        if (this.state.inEditMode) {
            switch(dataEditTypeConfig){
                case 'AggregateDataEdit':
                    dataEditType = <AggregateDataEdit isDefault={false} property={this.props.property} spec={this.props.spec} config={this.props.config} onAggDataEdit={this.handleAggDataEdit.bind(this)}/>;
                break;
                //still can use IndividualDataEdit on each instance
                case 'IndividualDataEdit':
                    isIndividual = true;
                    dataEditType = this.props.spec.instances.map(function(node, index) {
                        if(!node){
                            return undefined; // stop processing this iteration
                        }
                        return (
                            <IndividualObjectReactor key={index} inEditMode={true} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={self.props.isOnlyChild} onDelete={self.props.onIndividualDelete} onUpdate={self.props.onIndividualUpdate} onDetailUpdate={self.props.onIndividualDetailUpdate}/>
                        );
                    });
                break;
                default:
                    dataEditType = <AggregateDataEdit isDefault={false} property={this.props.property} spec={this.props.spec} config={this.props.config} onAggDataEdit={this.handleAggDataEdit.bind(this)}/>;
            }
        }else{
            switch(dataViewTypeConfig){
                case 'AggregateDataView':
                    dataViewType = <AggregateDataView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
                break;
                //will apply IndividualDataView on each child
                case 'IndividualDataView':
                    isIndividual = true;
                    dataViewType = this.props.spec.instances.map(function(node, index) {
                        if(!node){
                            return undefined; // stop processing this iteration
                        }
                        return (
                            <IndividualObjectReactor key={index} inEditMode={false} readOnly={self.props.readOnly} spec={node} config={self.props.config} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={self.props.isOnlyChild} onDelete={self.props.onIndividualDelete} onUpdate={self.props.onIndividualUpdate} onDetailUpdate={self.props.onIndividualDetailUpdate}/>
                        );
                    });
                break;
                default:
                    dataViewType = <AggregateDataView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
            }
        }
        let editDIV, saveDIV, undoDIV, deleteDIV;
        if(!this.props.readOnly){
            editDIV = <div ref="edit" title="edit" onClick={this.handleEdit.bind(this)} className="medium ui circular basic icon button">
                            <i className="edit large blue icon link "></i>
                      </div>;
            if(!isIndividual){
                saveDIV = <div ref="save" title="save" onClick={this.handleSave.bind(this)} className="medium ui circular basic icon button">
                            <i className="save large green icon link "></i>
                          </div>;
            }
            undoDIV = <div ref="undo" title="undo" onClick={this.handleUndo.bind(this)} className="medium ui circular basic icon button">
                                <i className="undo large blue icon link "></i>
                      </div>;
            if(this.props.config && this.props.config.allowNewValue && !this.props.isOnlyChild){
                deleteDIV = <div ref="delete" title="delete" onClick={this.handleAggDelete.bind(this)} className="medium ui circular basic icon button">
                                          <i className="trash outline large red icon link "></i>
                            </div>;
            }
        }
        if (this.state.inEditMode) {
            return (
                <div className="ui list" ref="aggregateObjectReactor">
                    <div className="item">
                        <div className="ui form grid">
                                <div className="twelve wide column field">
                                    {dataEditType}
                                </div>
                                <div className="four wide column field animated fadeInLeft">
                                    {saveDIV}
                                    {(this.state.showDelete? deleteDIV: '')}
                                    {undoDIV}
                                </div>
                        </div>
                    </div>
                </div>
            );
        }else{
            return (
                <div className="ui list" ref="aggregateObjectReactor">
                    <div className="item">
                        <div className="ui form grid">
                                <div className="twelve wide column field">
                                    {dataViewType}
                                </div>
                                <div className="four wide column field animated fadeInLeft">
                                    {editDIV}
                                </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default AggregateObjectReactor;
