import React from 'react';
import PropTypes from 'prop-types';
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
            outputDIV = <a href={this.props.spec.value} target="_blank" itemProp={this.props.property}> {val} </a>;
        }else{
            if(this.props.config){
                if(this.props.config.decodeURIComponent || this.props.decodeURIComponent){
                    val = decodeURIComponent(val);
                }else if (this.props.config.encodeURIComponent || this.props.encodeURIComponent) {
                    val = encodeURIComponent(val);
                }
            }
            outputDIV = <span itemProp={this.props.property}> {val} </span>;
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
    truncateURI: PropTypes.bool,
    /**
    only show the last part of the URI
    */
    shortenURI: PropTypes.bool,
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default BasicIndividualView;
