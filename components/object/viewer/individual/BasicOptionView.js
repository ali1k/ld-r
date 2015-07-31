import React from 'react';
import URIUtil from '../../../utils/URIUtil';

class BasicOptionView extends React.Component {
    prepareOption(value){
        let label = value;
        if(this.props.config && this.props.config.options){
            this.props.config.options.forEach(function(l) {
                if(l.value === value){
                    label = l.label;
                    return label;
                }
            });
        }
        return label;
    }
    render() {
        let outputDIV, label = this.prepareOption(this.props.spec.value);
        if(this.props.spec.valueType === 'uri'){
            if(this.props.config){
                if(this.props.config.shortenURI){
                    label = '<' + URIUtil.getURILabel(label) + '>';
                }
            }
            outputDIV = <a href={this.props.spec.value} target="_blank"> {label} </a>;
        }else{
            outputDIV = <span> {label} </span>;
        }
        return (
            <div className="ui" ref="basicOptionView">
                {outputDIV}
            </div>
        );
    }
}

export default BasicOptionView;
