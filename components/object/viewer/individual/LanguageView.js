import React from 'react';
import PropTypes from 'prop-types';
import {list} from '../../../../data/languages';
/**
display language values provided by iso639-1
*/
class LanguageView extends React.Component {
    getCodefromURI(uri) {
        if(uri){
            let tmp = uri.split('/');
            return tmp[tmp.length-1];
        }
        return uri;
    }
    getLanguage(code) {
        let o;
        list.forEach(function(l) {
            if(l.code === code){
                //o = l.name +'-'+ l.nativeName;
                o = l.name ;
                return o;
            }
        });
        return o;
    }
    prepareLanguage(uri){
        return this.getLanguage(this.getCodefromURI(uri));
    }
    render() {
        let outputDIV, lang;
        if(this.props.spec.valueType === 'uri'){
            lang = this.prepareLanguage(this.props.spec.value);
            outputDIV = <a href={this.props.spec.value} target="_blank" itemProp={this.props.property}> {lang} </a>;
        }else{
            outputDIV = <span itemProp={this.props.property}> {this.props.spec.value} </span>;
        }
        return (
            <div className="ui" ref="languageView">
                {outputDIV}
            </div>
        );
    }
}
LanguageView.propTypes = {
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default LanguageView;
