import React from 'react';

class BasicOptionInput extends React.Component {
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
            React.findDOMNode(this.refs.basicInputSelect).focus();
        }
    }

    createDefaultValue(valueType, dataType) {
        return this.props.config.defaultValue? this.props.config.defaultValue[0]: '';
    }
    handleChange(event) {
        this.props.onDataEdit(event.target.value);
        this.setState({value: event.target.value});
    }
    buildOptions() {
        let optionsList;
        if(this.props.config && this.props.config.options){
            optionsList = this.props.config.options.map(function(option, index) {
                return <option key={index} value={(option.value)}> {option.label} </option>;
            });
        }else{
            optionsList = <option value="0"> No option found in config! </option>;
        }
        return optionsList;
    }
    render() {
        let optionList = this.buildOptions();
        return (
            <div className="content ui form" ref="basicOptionInput">
                <div className="field">
                    <select className="ui search dropdown" ref="basicInputSelect" value={this.state.value} onChange={this.handleChange.bind(this)}>
                        {optionList}
                    </select>
                </div>
            </div>
        );
    }
}

export default BasicOptionInput;
