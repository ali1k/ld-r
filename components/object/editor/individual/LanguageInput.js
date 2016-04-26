import React from 'react';
import ReactDOM from 'react-dom';
import {list} from '../../../../data/languages';

class LanguageInput extends React.Component {
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
            ReactDOM.findDOMNode(this.refs.languageInputSelect).focus();
        }
    }

    createDefaultValue(valueType, dataType) {
        if(this.props.config && this.props.config.defaultValue){
            return this.props.config.defaultValue[0];
        }else{
            return 'http://id.loc.gov/vocabulary/iso639-1/en';
        }
    }
    handleChange(event) {
        this.props.onDataEdit(event.target.value);
        this.setState({value: event.target.value});
    }
    buildOptions(data) {
        let optionsList = data.map(function(lang, index) {
            return <option key={index} value={('http://id.loc.gov/vocabulary/iso639-1/'+lang.code)}> {lang.name}-{lang.nativeName}</option>;
        });
        return optionsList;
    }
    render() {
        let optionList = this.buildOptions(list);
        return (
            <div className="content ui form" ref="languageInput">
                <div className="field">
                    <select className="ui search dropdown" ref="languageInputSelect" value={this.state.value} onChange={this.handleChange.bind(this)}>
                        {optionList}
                    </select>
                </div>
            </div>
        );
    }
}

export default LanguageInput;
