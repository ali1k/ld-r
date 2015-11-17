import React from 'react';
import URIUtil from '../../../utils/URIUtil';
class BasicIndividualView extends React.Component {
    render() {
        let val, outputDIV;
        val = this.props.spec.value;
        if(this.props.spec.valueType === 'uri'){
            if(this.props.config){
                if(this.props.config.truncateURI){
                    val = '<' + URIUtil.truncateMiddle(val, 50, '') + '>';
                }else if (this.props.config.shortenURI) {
                    val = '<' + URIUtil.getURILabel(val) + '>';
                }
            }
            outputDIV = <a href={this.props.spec.value} target="_blank"> {val} </a>;
        }else{
            outputDIV = <span> {val} </span>;
        }
        return (
            <div className="ui" ref="basicIndividualView">
                {outputDIV}
            </div>
        );
    }
}

export default BasicIndividualView;
