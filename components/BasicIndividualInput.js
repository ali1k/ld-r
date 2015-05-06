import React from 'react';

class BasicIndividualInput extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        if(this.props.spec.isDefault){
            v = this.createDefaultValue(this.props.spec.valueType, this.props.spec.dataType);
        }
        //to initialize value in Property state
        this.props.onDataEdit(v);
        this.state = {value: v};
    }
    componentDidMount() {
        if(!this.props.noFocus){
            React.findDOMNode(this.refs.basicIndividualInput).focus();
        }
    }
    handleKeyDown(evt) {
        if(this.props.allowActionByKey){
            switch (evt.keyCode) {
                //case 9: // Tab
                case 13: // Enter
                    this.props.onEnterPress();
                    break;
            }
        }
    }
    getRandomNumber() {
        return Math.round(+new Date() / 1000);
    }
    createDefaultValue(valueType, dataType) {
        if(valueType === 'uri'){
            return 'http://example.com/' + this.getRandomNumber();
        }else{
            return 'exampleValue' + this.getRandomNumber();
        }
    }
    handleChange(event) {
        this.props.onDataEdit(event.target.value);
        this.setState({value: event.target.value});
    }
    render() {
        return (
            <div className="ui">
                <input ref="basicIndividualInput" type="text" value={this.state.value} onChange={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)}/>
            </div>
        );
    }
}

export default BasicIndividualInput;
