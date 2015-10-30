import React from 'react';
import ReactDOM from 'react-dom';

class BasicTextareaInput extends React.Component {
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
            ReactDOM.findDOMNode(this.refs.basicTextareaInput).focus();
        }
    }
    getRandomNumber() {
        return Math.round(+new Date() / 1000);
    }
    createDefaultValue(valueType, dataType) {
        if(this.props.config && this.props.config.defaultValue){
            return this.props.config.defaultValue[0];
        }else{
            if(valueType === 'uri'){
                return 'http://example.com/' + this.getRandomNumber();
            }else{
                return 'exampleValue' + this.getRandomNumber();
            }
        }
    }
    handleChange(event) {
        this.props.onDataEdit(event.target.value);
        this.setState({value: event.target.value});
    }
    render() {
        return (
            <div className="ui">
                <textarea ref="basicTextareaInput" value={this.state.value} onChange={this.handleChange.bind(this)}></textarea>
            </div>
        );
    }
}

export default BasicTextareaInput;
