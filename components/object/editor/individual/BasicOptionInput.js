import React from 'react';
import ReactDOM from 'react-dom';
import BasicIndividualInput from './BasicIndividualInput';
/**
a dropdown list of items as input
*/
class BasicOptionInput extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        if(this.props.spec.isDefault){
            v = this.createDefaultValue(this.props.spec.valueType, this.props.spec.dataType);
        }
        this.state = {value: v, userDefinedMode: 0};
    }
    componentDidMount() {
        if(!this.props.noFocus){
            ReactDOM.findDOMNode(this.refs.basicInputSelect).focus();
        }
    }
    componentWillMount() {
        //to initialize value in Property state
        this.props.onDataEdit(this.state.value);
    }
    createDefaultValue(valueType, dataType) {
        return this.props.config.defaultValue ? this.props.config.defaultValue[0] : '';
    }
    handleChange(event) {
        if(event.target.value === 'other'){
            this.setState({userDefinedMode: 1});

        }else{
            this.props.onDataEdit(event.target.value);
            this.setState({value: event.target.value});
        }
    }
    handleDataEdit(value){
        this.props.onDataEdit(value);
    }
    handleEnterPress(){
        this.props.onEnterPress();
    }
    buildOptions() {
        let self = this;
        let optionsList;
        let notInOptions = 1;
        if(this.props.config && this.props.config.options){
            optionsList = this.props.config.options.map(function(option, index) {
                if(option.value && option.label){
                    if(self.props.spec.value === option.value){
                        notInOptions = 0
                    }
                    return <option key={index} value={(option.value)}> {option.label} </option>;
                }else{
                    if(self.props.spec.value === option){
                        notInOptions = 0
                    }
                    return <option key={index} value={(option)}> {option} </option>;
                }
            });
        }else{
            optionsList = <option value="0"> No option found in config! </option>;
        }
        if(notInOptions){
            optionsList.push(<option key={self.props.config.options.length + 1} value={(self.props.spec.value)}> {self.props.spec.value} </option>);
        }
        return optionsList;
    }
    render() {
        let output;
        if(this.state.userDefinedMode){
            output = <BasicIndividualInput spec={{value: '', valueType: this.props.spec.valueType, dataType: this.props.spec.dataType}} config={this.props.config} onDataEdit={this.handleDataEdit.bind(this)} onEnterPress={this.handleEnterPress.bind(this)} allowActionByKey={true}/>;
        }else{
            let optionList = this.buildOptions();
            output = <div className="field">
                <select className="ui search dropdown" ref="basicInputSelect" value={this.state.value} onChange={this.handleChange.bind(this)}>
                    {optionList}
                    {(this.props.config.allowUserDefinedValue ? <option value="other"> **Other** </option> : '' )}
                </select>
            </div>;
        }
        return (
            <div className="content ui form" ref="basicOptionInput">
                {output}
            </div>
        );
    }
}

export default BasicOptionInput;
