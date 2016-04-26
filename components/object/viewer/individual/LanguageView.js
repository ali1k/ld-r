import React from 'react';
import {list} from '../../../../data/languages';

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
            outputDIV = <a href={this.props.spec.value} target="_blank"> {lang} </a>;
        }else{
            outputDIV = <span> {this.props.spec.value} </span>;
        }
        return (
            <div className="ui" ref="languageView">
                {outputDIV}
            </div>
        );
    }
}

export default LanguageView;
