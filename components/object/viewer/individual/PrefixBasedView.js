import React from 'react';
import {list} from '../../../../data/prefixes';

class PrefixBasedView extends React.Component {
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
    render() {
        let outputDIV, shotened;
        if(this.props.spec.valueType === 'uri'){
            shotened = this.preparePrefix(this.props.spec.value);
            outputDIV = <a href={this.props.spec.value} target="_blank"> {shotened} </a>;
        }else{
            outputDIV = <span> {this.props.spec.value} </span>;
        }
        return (
            <div className="ui" ref="prefixBasedView">
                {outputDIV}
            </div>
        );
    }
}

export default PrefixBasedView;
