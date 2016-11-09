import React from 'react';
import ReactDOM from 'react-dom';
import {list} from '../../../../data/prefixes';

class PrefixBasedInput extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        if (this.props.spec.isDefault) {
            v = this.createDefaultValue(this.props.spec.valueType, this.props.spec.dataType);
        }
        //to initialize value in Property state
        this.props.onDataEdit(v);
        this.state = {
            value: v
        };
    }
    componentDidMount() {
        if (!this.props.noFocus) {
            ReactDOM.findDOMNode(this.refs.prefixBasedInput).focus();
        }
    }
    handleKeyDown(evt) {
        if (this.props.allowActionByKey) {
            switch (evt.keyCode) {
                    //case 9: // Tab
                case 13: // Enter
                    this.props.onEnterPress();
                    break;
            }
        }
    }
    getRandomNumber() {
        return Math.round(+ new Date() / 1000);
    }
    createDefaultValue(valueType, dataType) {
        let dynamicDomain = 'http://example.com';
        if (this.props.config && this.props.config.dynamicResourceDomain) {
            dynamicDomain = this.props.config.dynamicResourceDomain[0];
        }
        if (this.props.config && this.props.config.defaultValue) {
            return this.props.config.defaultValue[0];
        } else {
            if (valueType === 'uri') {
                return dynamicDomain + '/' + this.getRandomNumber();
            } else {
                return 'exampleValue' + this.getRandomNumber();
            }
        }
    }
    getPrefix(uri) {
        let o = {prefix: '', url: ''};
        for(let prop in list){
            if(uri.indexOf(list[prop]) !== -1){
                o.prefix = prop;
                o.uri = list[prop];
                return o;
            }
        }
        return o;
    }
    makeShorten(uri, prefixObject){
        if(prefixObject.prefix){
            return uri.replace(prefixObject.uri, prefixObject.prefix + ':');
        }else{
            return uri;
        }
    }
    preparePrefix(uri){
        return this.makeShorten(uri, this.getPrefix(uri));
    }
    applyPrefix(value) {
        let tmp = value.split(':');
        if (tmp.length && value.indexOf('http://') === -1) {
            if (list[tmp[0]]) {
                return value.replace(tmp[0] + ':', list[tmp[0]]);
            } else {
                return value;
            }
        } else {
            return value;
        }
    }
    handleChange(event) {
        this.props.onDataEdit(this.applyPrefix(event.target.value.trim()));
        this.setState({value: event.target.value});
    }
    render() {
        let placeholder = '';
        //placeholder can come from config or direct property
        if (this.props.config && this.props.config.placeholder) {
            placeholder = this.props.config.placeholder[0];
        } else {
            if (this.props.placeholder) {
                placeholder = this.props.placeholder;
            }
        }
        return (
            <div className="ui">
                <input ref="prefixBasedInput" type="text" value={this.preparePrefix(this.state.value)} placeholder={placeholder} onChange={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)}/>
            </div>
        );
    }
}

export default PrefixBasedInput;
