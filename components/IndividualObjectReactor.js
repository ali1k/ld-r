import React from 'react';
import {provideContext} from 'fluxible/addons';
import loadObjectProperties from '../actions/loadObjectProperties';
import IndividualDataView from './IndividualDataView';
import IndividualDataEdit from './IndividualDataEdit';
import IndividualObjectStore from '../stores/IndividualObjectStore';
import {connectToStores} from 'fluxible/addons';

class IndividualObjectReactor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {objectValue: this.props.spec.value, detailData: {}, inEditMode: this.props.inEditMode? 1 : 0, readOnly: this.props.readOnly, isExtendedView: 0};
    }
    handleEdit(){
        //check if it is extended
        if(this.props.spec.extended && !this.state.isExtendedView){
            this.context.executeAction(loadObjectProperties, {
              dataset: this.props.graphName,
              objectURI: this.props.spec.value
            });
            this.setState({isExtendedView: 1});
        }
        this.setState({inEditMode: 1});
    }
    handleDataEdit(value){
        this.setState({objectValue: value});
    }
    handleDetailDataEdit(detailData){
        this.setState({detailData: detailData});
    }
    handleSave(){
        if(this.props.isNewValue){
            this.props.onCreate(this.state.objectValue, this.props.spec.valueType);
        }else{
            //check if it is extended
            if(this.props.spec.extended){
                this.props.onDetailUpdate(this.props.spec.value, this.state.objectValue, this.props.spec.valueType, this.state.detailData);
                this.setState({inEditMode: 0, isExtendedView: 0});
            }else{
                //update only in case of change
                if(this.props.spec.value !== this.state.objectValue){
                    this.props.onUpdate(this.props.spec.value, this.state.objectValue, this.props.spec.valueType);
                }
                this.setState({inEditMode: 0});
            }
        }
    }
    handleDelete(){
        this.props.onDelete(this.props.spec.value, this.props.spec.valueType);
    }
    handleUndo(){
        this.setState({objectValue: this.props.spec.value, inEditMode: 0});
    }
    handleShowDetails(){
        this.context.executeAction(loadObjectProperties, {
          dataset: this.props.graphName,
          objectURI: this.props.spec.value
        });
        this.setState({isExtendedView: 1});
    }
    handleHideDetails(){
        this.setState({isExtendedView: 0});
    }
    handleAddDetails(){
        this.setState({inEditMode: 0});
    }
    render() {
        //add object Properties only to the relevant ones
        if(this.props.spec.extended){
            if(this.state.isExtendedView){
                this.props.spec.extendedViewData = this.props.IndividualObjectStore.objectProperties[this.props.spec.value];
            }else{
                this.props.spec.extendedViewData = 0;
            }
        }
        let dataViewType, dataEditType;
        switch(this.props.config? (this.props.config.dataViewType? this.props.config.dataViewType[0]:'') : ''){
            case 'IndividualDataView':
                dataViewType = <IndividualDataView spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                dataViewType = <IndividualDataView spec={this.props.spec} config={this.props.config}/>;
        }
        switch(this.props.config? (this.props.config.dataEditType? this.props.config.dataEditType[0]:'') : ''){
            case 'IndividualDataEdit':
                dataEditType = <IndividualDataEdit property={this.props.property} spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)}/>;
            break;
            default:
                dataEditType = <IndividualDataEdit property={this.props.property} spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)}/>;
        }
        let editDIV, saveDIV, undoDIV, detailDIV, deleteDIV;
        //disable edit in readOnly mode
        if(!this.state.readOnly){
            editDIV = <div title="edit" onClick={this.handleEdit.bind(this)} className="medium ui circular basic icon button">
                            <i className="edit large blue icon link "></i>
                      </div>;
            saveDIV = <div title="save" onClick={this.handleSave.bind(this)} className="medium ui circular basic icon button">
                            <i className="save large green icon link "></i>
                      </div>;
            if(!this.props.isNewValue){
                undoDIV = <div title="undo" onClick={this.handleUndo.bind(this)} className="medium ui circular basic icon button">
                                <i className="undo large blue icon link "></i>
                          </div>;
            }
            if(this.props.config && this.props.config.allowNewValue && !this.props.isOnlyChild){
                deleteDIV = <div title="delete" onClick={this.handleDelete.bind(this)} className="medium ui circular basic icon button">
                                <i className="minus square large red icon link "></i>
                          </div>;
            }
        }
        if(this.props.spec.extended){
            if(this.state.isExtendedView){
                detailDIV = <div title="show details" onClick={this.handleHideDetails.bind(this)} className="medium ui circular basic icon button">
                                <i className="hide large blue icon link "> </i>
                            </div>;
            }else{
                detailDIV = <div title="show details" onClick={this.handleShowDetails.bind(this)} className="medium ui circular basic icon button">
                                <i className="unhide large blue icon link "> </i>
                            </div>;
            }
        }else{
            //show add detail icon if enabled
            if(this.props.config && this.props.config.allowExtension && !this.state.readOnly){

                detailDIV = <div title="add details" onClick={this.handleAddDetails.bind(this)} className="medium ui circular basic icon button">
                                <i className="add circle large blue icon link "> </i>
                            </div>;
            }
        }
        if (this.state.inEditMode) {
            //edit mode
            return (
                <div className="ui list">
                    <div className="item">
                        <div className="ui form grid">
                                <div className="twelve wide column field">
                                        {dataEditType}
                                </div>
                                <div className="four wide column field">
                                    {saveDIV}
                                    {undoDIV}
                                </div>
                        </div>
                    </div>
                </div>
            );
        }else{
            //view mode
            return (
                <div className="ui list">
                    <div className="item">
                        <div className="ui form grid">
                                <div className="twelve wide column field">
                                    {dataViewType}
                                </div>
                                <div className="four wide column field animated fadeInLeft">
                                    {detailDIV}
                                    {editDIV}
                                    {deleteDIV}
                                </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}
IndividualObjectReactor.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
IndividualObjectReactor = connectToStores(IndividualObjectReactor, [IndividualObjectStore], function (stores, props) {
    return {
        IndividualObjectStore: stores.IndividualObjectStore.getState()
    };
});
export default IndividualObjectReactor;
