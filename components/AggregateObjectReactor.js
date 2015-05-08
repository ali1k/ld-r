import React from 'react';
import AggregateDataView from './AggregateDataView';
import AggregateDataEdit from './AggregateDataEdit';

class AggregateObjectReactor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {inEditMode: this.props.inEditMode? 1 : 0, readOnly: this.props.readOnly};
    }
    handleEdit(){
        this.setState({inEditMode: 1});
    }
    handleSave(){
        this.setState({inEditMode: 0});
    }
    handleUndo(){
        this.setState({inEditMode: 0});
    }
    render() {
        let dataViewType, dataEditType;
        switch(this.props.config? (this.props.config.dataViewType? this.props.config.dataViewType[0]:'') : ''){
            case 'AggregateDataView':
                dataViewType = <AggregateDataView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                dataViewType = <AggregateDataView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
        }
        switch(this.props.config? (this.props.config.dataEditType? this.props.config.dataEditType[0]:'') : ''){
            case 'AggregateDataEdit':
                dataEditType = <AggregateDataEdit isDefault="0" property={this.props.property} spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                dataEditType = <AggregateDataEdit isDefault="0" property={this.props.property} spec={this.props.spec} config={this.props.config}/>;
        }
        let editDIV, saveDIV, undoDIV;
        if(!this.state.readOnly){
            editDIV = <div ref="edit" title="edit" onClick={this.handleEdit.bind(this)} className="medium ui circular basic icon button">
                            <i className="edit large blue icon link "></i>
                      </div>;
            saveDIV = <div ref="save" title="save" onClick={this.handleSave.bind(this)} className="medium ui circular basic icon button">
                            <i className="save large green icon link "></i>
                      </div>;
            if(!this.props.isNewValue){
                undoDIV = <div ref="undo" title="undo" onClick={this.handleUndo.bind(this)} className="medium ui circular basic icon button">
                                <i className="undo large blue icon link "></i>
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
