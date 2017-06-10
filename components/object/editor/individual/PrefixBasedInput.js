import React from 'react';
import ReactDOM from 'react-dom';
import {list} from '../../../../data/prefixes';
import {autocompletelist} from '../../../../data/autocompletes';
import {Search, Grid, Header} from 'semantic-ui-react';
import lodashCollection from 'lodash/collection';
import lodashString from 'lodash/string';
/**
A component to add CURIs based on common prefixes
*/
class PrefixBasedInput extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        if (this.props.spec.isDefault) {
            v = this.createDefaultValue(this.props.spec.valueType, this.props.spec.dataType);
        }
        this.state = {
            value: v,
            results: [],
            isLoading: false
        };
    }
    componentDidMount() {
        if (!this.props.noFocus) {
            ReactDOM.findDOMNode(this.refs.prefixBasedInput).focus();
        }
    }
    componentWillMount() {
        //to initialize value in Property state
        this.props.onDataEdit(this.state.value);
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
        if (this.props.config && this.props.config.dynamicReautocompletelistDomain) {
            dynamicDomain = this.props.config.dynamicReautocompletelistDomain[0];
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
        //case of propertyPath
        let out = [];
        let tmp = uri.split('->');
        let tmp2, tmp22;
        if(tmp.length > 1){
            tmp.forEach((v)=>{
                tmp2 = v.split(']');
                //check named graphs
                if(tmp2.length > 1){
                    let tmp3 = tmp2[0].replace('[', ''), tmp4 = tmp2[1];
                    tmp22 = tmp3.split('>>');
                    //federeated facets
                    if(tmp22.length > 1){
                        out.push('['+this.makeShorten(tmp22[0], this.getPrefix(tmp22[0]))+'>>'+this.makeShorten(tmp22[1], this.getPrefix(tmp22[1]))+']'+this.makeShorten(tmp4, this.getPrefix(tmp4)));
                    }else{
                        out.push('['+this.makeShorten(tmp3, this.getPrefix(tmp3))+']'+this.makeShorten(tmp4, this.getPrefix(tmp4)));
                    }
                }else{
                    out.push(this.makeShorten(v, this.getPrefix(v)))
                }
            });
            return out.join('->');
        }else{
            return this.makeShorten(uri, this.getPrefix(uri));
        }
    }
    removePrefix(uri){
        //case of propertyPath
        let out = [];
        let tmp = uri.split('->');
        let tmp2, tmp22;
        if(tmp.length > 1){
            tmp.forEach((v)=>{
                tmp2 = v.split(']');
                //check named graphs
                if(tmp2.length > 1){
                    let tmp3 = tmp2[0].replace('[', ''), tmp4 = tmp2[1], tmp5, tmp6;
                    tmp22 = tmp3.split('>>');
                    //federeated facets
                    if(tmp22.length > 1){
                        tmp5 = tmp22[0];
                        tmp6 = tmp22[1];
                        if(tmp5.split(':')[0]!=='http' && tmp5.split(':')[0]!=='https'){
                            tmp5 = tmp5.replace(tmp5.split(':')[0] + ':', list[tmp5.split(':')[0]]);
                        }
                        if(tmp6.split(':')[0]!=='http' && tmp6.split(':')[0]!=='https'){
                            tmp6 = tmp6.replace(tmp6.split(':')[0] + ':', list[tmp6.split(':')[0]]);
                        }
                        if(tmp4.split(':')[0]!=='http' && tmp4.split(':')[0]!=='https'){
                            tmp4 = tmp4.replace(tmp4.split(':')[0] + ':', list[tmp4.split(':')[0]]);
                        }
                        out.push('['+tmp5+'>>'+tmp6+']'+tmp4);
                    }else{
                        if(tmp3.split(':')[0]!=='http' && tmp3.split(':')[0]!=='https'){
                            tmp3 = tmp3.replace(tmp3.split(':')[0] + ':', list[tmp3.split(':')[0]]);
                        }
                        if(tmp4.split(':')[0]!=='http' && tmp4.split(':')[0]!=='https'){
                            tmp4 = tmp4.replace(tmp4.split(':')[0] + ':', list[tmp4.split(':')[0]]);
                        }
                        out.push('['+tmp3+']'+tmp4);
                    }
                }else{
                    if(v.split(':')[0]!=='http' && v.split(':')[0]!=='https'){
                        out.push(v.replace(v.split(':')[0] + ':', list[v.split(':')[0]]));
                    }else{
                        out.push(v);
                    }
                }
            })
            return out.join('->');
        }else{
            let tmp2 = uri.split(':');
            if(tmp2[0]!=='http'){
                return uri.replace(tmp2[0] + ':', list[tmp2[0]]);
            }else{
                return uri;
            }

        }
    }
    applyPrefix(value) {
        let valueD = value;
        let preg = '';
        let parts = value.split('<-');
        if(parts.length > 1){
            valueD = parts[1];
            preg = parts[0] + '<-';
        }

        let tmp = valueD.split('->');
        if(tmp.length > 1){
            return preg + this.removePrefix(valueD);
        }else{
            let tmp2 = valueD.split(':');
            if (tmp2.length && valueD.indexOf('http://') === -1) {
                if (list[tmp2[0]]) {
                    return preg + valueD.replace(tmp2[0] + ':', list[tmp2[0]]);
                } else {
                    return preg + valueD;
                }
            } else {
                return preg + valueD;
            }
        }

    }
    resetComponent() {
        let self = this;
        this.setState({
            value: '',
            results: [],
            isLoading: false
        });
    }
    //when user clicks on results
    handleChange(event, result) {
        this.setState({value: result.title});
        this.props.onDataEdit(this.applyPrefix(result.title.trim()));
    }
    handleSearchChange(alist, event, value) {
        this.props.onDataEdit(this.applyPrefix(event.target.value.trim()));
        this.setState({ isLoading: true, value: event.target.value });
        setTimeout(() => {
            if (this.state.value.length < 1) return this.resetComponent()

            const re = new RegExp(lodashString.escapeRegExp(this.state.value), 'i')
            const isMatch = (result) => re.test(result.title)
            this.setState({
                isLoading: false,
                results: lodashCollection.filter(alist, isMatch),
            })
        }, 500)
    }
    render() {
        let alist = [];
        //customize the autocompelte list
        if(this.props.autocompletelist && this.props.autocompletelist.length){
            alist = this.props.autocompletelist;
        }else if(this.props.config && this.props.config.autocompletelist && this.props.config.autocompletelist.length){
            alist = this.props.config.autocompletelist;
        }else if(this.props.includeOnly && this.props.includeOnly.length){
            let tmp = [];
            this.props.includeOnly.forEach((item)=>{
                tmp = tmp.concat(autocompletelist[item]);
            });
            alist = tmp;
        }else if(this.props.config && this.props.config.includeOnly && this.props.config.includeOnly.length){
            let tmp = [];
            this.props.config.includeOnly.forEach((item)=>{
                tmp = tmp.concat(autocompletelist[item]);
            });
            alist = tmp;
        }else{
            //default autocomplete list
            alist = [].concat(autocompletelist.ldrClasses, autocompletelist.ldrProperties, autocompletelist.ldrLiterals, autocompletelist.properties, autocompletelist.classes);
        }
        let placeholder = '';
        //placeholder can come from config or direct property
        if (this.props.config && this.props.config.placeholder) {
            placeholder = this.props.config.placeholder[0];
        } else {
            if (this.props.placeholder) {
                placeholder = this.props.placeholder;
            }
        }
        let { value, results, isLoading } = this.state;
        return (
            <div className="sixteen wide column field">
                <Search showNoResults={false} icon="cube" ref="prefixBasedInput" type="text" loading={isLoading} value={this.preparePrefix(value)} placeholder={placeholder} onResultSelect={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)} onSearchChange={this.handleSearchChange.bind(this, alist)} results={results}/>
            </div>
        );
    }
}

export default PrefixBasedInput;
