import React from 'react';
import ReactDOM from 'react-dom';

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
            ReactDOM.findDOMNode(this.refs.basicIndividualInput).focus();
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
        let dynamicDomain = 'http://example.com';
        if(this.props.config && this.props.config.dynamicResourceDomain){
            dynamicDomain = this.props.config.dynamicResourceDomain[0];
        }
        if(this.props.config && this.props.config.defaultValue){
            return this.props.config.defaultValue[0];
        }else{
            if(valueType === 'uri'){
                return dynamicDomain + '/' + this.getRandomNumber();
            }else{
                return 'exampleValue' + this.getRandomNumber();
            }
        }
    }
    handleChange(event) {
        this.props.onDataEdit(event.target.value.trim());
        this.setState({value: event.target.value});
    }
    render() {
        let placeholder = '';
        //placeholder can come from config or direct property
        if(this.props.config && this.props.config.placeholder){
            placeholder = this.props.config.placeholder[0];
        }else{
            if(this.props.placeholder){
                placeholder = this.props.placeholder;
            }
        }
        return (
            <div className="ui">
                <input ref="basicIndividualInput" type="text" value={this.state.value} placeholder={placeholder} onChange={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)}/>
            </div>
        );
    }
}

export default BasicIndividualInput;
