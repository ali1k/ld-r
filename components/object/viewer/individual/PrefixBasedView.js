import React from 'react';
import PropTypes from 'prop-types';
import {list} from '../../../../data/prefixes';
/**
Display compact URIs using common prefixes
*/
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
        //case of propertyPath
        let out = [];
        let tmp = uri.split('->');
        if(tmp.length > 1){
            tmp.forEach((v)=>{
                out.push(this.makeShorten(v, this.getPrefix(v)))
            })
            return out.join('->');
        }else{
            return this.makeShorten(uri, this.getPrefix(uri));
        }
    }
    render() {
        let outputDIV, shortened;
        if(this.props.spec.valueType === 'uri' || this.props.spec.value.indexOf('http://') !== -1){
            shortened = this.preparePrefix(this.props.spec.value);
            outputDIV = <a href={this.props.spec.value} target="_blank"> {shortened} </a>;
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
PrefixBasedView.propTypes = {
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default PrefixBasedView;
