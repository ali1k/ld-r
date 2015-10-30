import React from 'react';
import PropertyHeader from '../../../property/PropertyHeader';
import ObjectIEditor from '../../ObjectIEditor';
import BasicIndividualInput from './BasicIndividualInput';

class BasicIndividualDetailEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        let currentComp = this.refs.detailPropertiesEdit;
    }
    handleDataEdit(value){
        this.props.onDataEdit(value);
    }
    handleDetailDataEdit(propertyURI, valueType, dataType, value){
        this.state[propertyURI] = {value: value, valueType: valueType, dataType: dataType};
        this.props.onDetailDataEdit(this.state);
    }
    handleEnterPress(){
        this.props.onEnterPress();
    }

    render() {
        let self = this;
        let list = this.props.spec.extendedViewData.map(function(node, index) {
            let llist = node.spec.instances.map(function(instance, index2){
                return (
                    <ObjectIEditor noFocus="1" key={index + '_' + index2} spec={instance} config={node.config} graphName={self.props.graphName} onDataEdit={self.handleDetailDataEdit.bind(self, node.spec.propertyURI, instance.valueType, instance.dataType)}/>
                );
            });
            return (
                <div className="item" key={index}>
                    <div className="ui">
                        <div className="ui horizontal list">
                            <div className="item">
                                <PropertyHeader spec={node.spec} config={node.config} size="4" />
                            </div>
                        </div>
                        <div className="ui dividing header"></div>
                        <div className="fourteen wide column field list">
                                {llist}
                        </div>
                        <div className="one wide column field">

                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div ref="detailPropertiesEdit">
                <div className="ui attached primary segment">
                    <div className="ui list">
                        {list}
                    </div>
                </div>
            </div>
        );
    }
}

export default BasicIndividualDetailEdit;
