import React from 'react';
import PropertyHeader from './PropertyHeader';
import BasicIndividualInput from './BasicIndividualInput';

class BasicIndividualDetailEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        let currentComp = this.refs.detailPropertiesEdit.getDOMNode();
    }
    handleDataEdit(value){
        this.props.onDataEdit(value);
    }
    handleDetailDataEdit(propertyURI, valueType, dataType, value){
        this.state[propertyURI] = {value: value, valueType: valueType, dataType: dataType};
        this.props.onDetailDataEdit(this.state);
    }
    render() {
        let self = this;
        let list = this.props.spec.extendedViewData.map(function(node, index) {
            return (
                <div className="item" key={index}>
                    <div className="ui form grid">
                        <div className="ui horizontal list">
                            <div className="item">
                                <PropertyHeader spec={node.spec} config={node.config} size="4" />
                            </div>
                        </div>
                        <div className="ui dividing header"></div>
                        <div className="fourteen wide column field list">
                            <div className="ui attached secondary segment">
                                <BasicIndividualInput spec={node.spec} config={node.config} onDataEdit={self.handleDetailDataEdit.bind(self, node.spec.propertyURI, node.spec.valueType, node.spec.dataType)}/>
                            </div>
                        </div>
                        <div className="one wide column field">

                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div ref="detailPropertiesEdit">
                <div className="ui attached secondary segment">
                <BasicIndividualInput spec={{value: this.props.spec.value, valueType: this.props.spec. valueType, dataType: this.props.spec.dataType}} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)}/>
                </div>
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
