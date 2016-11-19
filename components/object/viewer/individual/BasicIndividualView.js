import React from 'react';
import URIUtil from '../../../utils/URIUtil';
/**
Default component to display object values
*/
class BasicIndividualView extends React.Component {
    render() {
        let val, outputDIV;
        val = this.props.spec.value;
        if(this.props.spec.valueType === 'uri'){
            if(this.props.config){
                if(this.props.config.truncateURI || this.props.truncateURI){
                    val = '<' + URIUtil.truncateMiddle(val, 50, '') + '>';
                }else if (this.props.config.shortenURI || this.props.shortenURI) {
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
BasicIndividualView.propTypes = {
    /**
    truncate URI from the middle
    */
    truncateURI: React.PropTypes.bool,
    /**
    only show the last part of the URI
    */
    shortenURI: React.PropTypes.bool,
    /**
    LD-R Configurations object
    */
    config: React.PropTypes.object,
    /**
    LD-R spec
    */
    spec: React.PropTypes.object
};
export default BasicIndividualView;
