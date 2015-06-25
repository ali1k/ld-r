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
        this.state = {objectValue: this.props.spec.value, detailData: {}, inEditMode: this.props.inEditMode, isExtendedView: 0};
    }
    componentDidMount() {
        let self = this;
        //a trick to allow cascading actions
        let wtime = Math.floor(Math.random() * 1500) + 100;
        //expand blank nodes
        if(this.props.config && this.props.config.hasBlankNode && this.props.spec.extended && !this.state.isExtendedView){
            setTimeout(function(){
                self.handleShowDetails();
            }, wtime);
        }
    }
    handleEdit() {
        //check if it is extended
        if(this.props.spec.extended && !this.state.isExtendedView){
            this.context.executeAction(loadObjectProperties, {
              dataset: this.props.graphName,
              propertyURI: this.props.property,
              objectURI: this.props.spec.value
            });
            this.setState({isExtendedView: 1});
        }
        this.setState({inEditMode: 1});
    }
    handleAddDetails() {
        this.setState({inEditMode: 1, isExtendedView: 1});
    }
    handleDataEdit(value) {
        this.setState({objectValue: value});
    }
    handleDetailDataEdit(detailData) {
        this.setState({detailData: detailData});
    }
    handleSave() {
        if(this.props.isNewValue){
            this.props.onCreate(this.state.objectValue, this.props.spec.valueType, this.props.spec.dataType);
        }else{
            //check if it is extended
            if(this.props.spec.extended || this.state.isExtendedView){
                this.props.onDetailUpdate(this.props.spec.value, this.state.objectValue, this.props.spec.valueType, this.props.spec.dataType, this.state.detailData);
                if(this.state.isExtendedView){
                    this.props.spec.extended = 1;
                }
                this.setState({inEditMode: 0, isExtendedView: 0});
            }else{
                //update only in case of change
                if(this.props.spec.value !== this.state.objectValue){
                    this.props.onUpdate(this.props.spec.value, this.state.objectValue, this.props.spec.valueType, this.props.spec.dataType);
                }
                this.setState({inEditMode: 0});
            }
        }
    }
    handleDelete() {
        this.props.onDelete(this.props.spec.value, this.props.spec.valueType, this.props.spec.dataType);
    }
    handleUndo() {
        this.setState({objectValue: this.props.spec.value, inEditMode: 0, isExtendedView: 0});
    }
    handleShowDetails() {
        this.context.executeAction(loadObjectProperties, {
          dataset: this.props.graphName,
          propertyURI: this.props.property,
          objectURI: this.props.spec.value
        });
        this.setState({isExtendedView: 1});
    }
    handleHideDetails() {
        this.setState({isExtendedView: 0});
    }
    render() {
        //add object Properties only to the relevant ones
        if(this.state.isExtendedView){
            if(this.props.spec.extended){
                this.props.spec.extendedViewData = this.props.IndividualObjectStore.objectProperties[this.props.spec.value];
            }else{
                //add default details situation
                if(this.props.config && this.props.config.extensions){
                    //get from config and build as a list
                    this.props.spec.extendedViewData = this.props.config.extensions;
                }else{
                    //use default
                    this.props.spec.extendedViewData = [
                        {
                            spec: {
                                propertyURI: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                                instances: [{value: 'http://xmlns.com/foaf/0.1/Person', valueType: 'uri'}]
                            },
                            config: {
                                hint: ['Type of the entity'],
                                label: ['Type']
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://www.w3.org/2000/01/rdf-schema#label',
                                instances: [{value: 'Label', valueType: 'literal'}]
                            },
                            config: {
                                hint: ['A descriptor label for the URI'],
                                label: ['Label']
                            }
                        }
                    ];
                }
            }
        }else{
            this.props.spec.extendedViewData = 0;
        }
        let dataViewType, dataViewTypeConfig = '', dataEditType, dataEditTypeConfig = '';
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
                case 'IndividualDataEdit':
                    dataEditType = <IndividualDataEdit isDefault={false} property={this.props.property} spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)} onEnterPress={this.handleSave.bind(this)}/>;
                break;
                default:
                    dataEditType = <IndividualDataEdit isDefault={false} property={this.props.property} spec={this.props.spec} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onDetailDataEdit={this.handleDetailDataEdit.bind(this)} onEnterPress={this.handleSave.bind(this)}/>;
            }
        }else{
            switch(dataViewTypeConfig){
                case 'IndividualDataView':
                    dataViewType = <IndividualDataView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
                break;
                default:
                    dataViewType = <IndividualDataView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
            }
        }
        let editDIV, saveDIV, undoDIV, detailDIV, deleteDIV;
        //disable edit in readOnly mode
        if(!this.props.readOnly){
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
            if(this.props.config && this.props.config.allowNewValue && !this.props.isOnlyChild){
                deleteDIV = <div ref="delete" title="delete" onClick={this.handleDelete.bind(this)} className="medium ui circular basic icon button">
                                <i className="trash outline large red icon link "></i>
                          </div>;
            }
        }
        if(this.props.spec.extended){
            if(this.state.isExtendedView){
                detailDIV = <div ref="hideDetails" title="hide details" onClick={this.handleHideDetails.bind(this)} className="medium ui circular basic icon button">
                                <i className="hide large blue icon link "> </i>
                            </div>;
            }else{
                detailDIV = <div ref="showDetails" title="show details" onClick={this.handleShowDetails.bind(this)} className="medium ui circular basic icon button">
                                <i className="unhide large blue icon link "> </i>
                            </div>;
            }
        }else{
            //show add detail icon if enabled
            if(this.props.config && this.props.config.allowExtension && !this.props.readOnly){

                detailDIV = <div ref="addDetails" title="add details" onClick={this.handleAddDetails.bind(this)} className="medium ui circular basic icon button">
                                <i className="add circle large blue icon link "> </i>
                            </div>;
            }
        }
        if (this.state.inEditMode) {
            //edit mode
            return (
                <div className="ui list" ref="individualObjectReactor">
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
                <div className="ui list" ref="individualObjectReactor">
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
