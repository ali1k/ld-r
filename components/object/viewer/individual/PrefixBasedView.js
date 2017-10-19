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
        let tmp2, tmp22;
        if(tmp.length > 1){
            tmp.forEach((v)=>{
                tmp2 = v.split(']');
                //check named graphs
                if(tmp2.length > 1){
                    let tmp3 = tmp2[0].replace('[', ''), tmp4 = tmp2[1];
                    tmp22 = tmp3.split('>>');

                    //for intermediate links
                    let tmp4i = tmp4.split('||');
                    if(tmp4i.length > 1){
                        //federeated facets
                        if(tmp22.length > 1){
                            out.push('['+this.makeShorten(tmp22[0], this.getPrefix(tmp22[0]))+'>>'+this.makeShorten(tmp22[1], this.getPrefix(tmp22[1]))+']'+this.makeShorten(tmp4i[0], this.getPrefix(tmp4i[0]))+'||'+this.makeShorten(tmp4i[1], this.getPrefix(tmp4i[1])));
                        }else{
                            out.push('['+this.makeShorten(tmp3, this.getPrefix(tmp3))+']'+this.makeShorten(tmp4i[0], this.getPrefix(tmp4i[0]))+'||'+this.makeShorten(tmp4i[1], this.getPrefix(tmp4i[1])));
                        }
                    }else{
                        //federeated facets
                        if(tmp22.length > 1){
                            out.push('['+this.makeShorten(tmp22[0], this.getPrefix(tmp22[0]))+'>>'+this.makeShorten(tmp22[1], this.getPrefix(tmp22[1]))+']'+this.makeShorten(tmp4, this.getPrefix(tmp4)));
                        }else{
                            out.push('['+this.makeShorten(tmp3, this.getPrefix(tmp3))+']'+this.makeShorten(tmp4, this.getPrefix(tmp4)));
                        }
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
    render() {
        let outputDIV, shortened;
        if(this.props.spec.valueType === 'uri' || this.props.spec.value.indexOf('http://') !== -1){
            shortened = this.preparePrefix(this.props.spec.value);
            outputDIV = <a href={this.props.spec.value} target="_blank" itemProp={this.props.property}> {shortened} </a>;
        }else{
            outputDIV = <span itemProp={this.props.property}> {this.props.spec.value} </span>;
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
