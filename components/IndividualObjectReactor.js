import React from 'react';
import IndividualDataView from './IndividualDataView';
import IndividualDataEdit from './IndividualDataEdit';

class IndividualObjectReactor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isEditMode: 0, readOnly: this.props.readOnly};
    }
    handleEdit(evt){
        this.setState({isEditMode: 1});
    }
    handleSave(evt){
        this.setState({isEditMode: 0});
    }
    handleUndo(evt){
        this.setState({isEditMode: 0});
    }
    handleDetails(evt){
        this.setState({isEditMode: 0});
    }
    handleAddDetails(evt){
        this.setState({isEditMode: 0});
    }
    render() {
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
                dataEditType = <IndividualDataEdit spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                dataEditType = <IndividualDataEdit spec={this.props.spec} config={this.props.config}/>;
        }
        let editDIV, saveDIV, undoDIV, detailDIV;
        //disable edit in readOnly mode
        if(!this.state.readOnly){
            editDIV = <div title="edit" onClick={this.handleEdit.bind(this)} className="medium ui circular basic icon button">
                            <i className="edit large blue icon link "></i>
                      </div>;
            saveDIV = <div title="save" onClick={this.handleSave.bind(this)} className="medium ui circular basic icon button">
                            <i className="save large blue icon link "></i>
                      </div>;
            undoDIV = <div title="undo" onClick={this.handleUndo.bind(this)} className="medium ui circular basic icon button">
                            <i className="undo large green icon link "></i>
                      </div>;
        }
        if(this.props.spec.extended){
            detailDIV = <div title="show details" onClick={this.handleDetails.bind(this)} className="medium ui circular basic icon button">
                            <i className="unhide large blue icon link "> </i>
                        </div>;
        }else{
            //show add detail icon if enabled
            if(this.props.config && this.props.config.allowExtension){

                detailDIV = <div title="add details" onClick={this.handleAddDetails.bind(this)} className="medium ui circular basic icon button">
                                <i className="add user large blue icon link "> </i>
                            </div>;
            }
        }
        if (this.state.isEditMode) {
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
                                <div className="four wide column field">
                                    {detailDIV}
                                    {editDIV}
                                </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default IndividualObjectReactor;
