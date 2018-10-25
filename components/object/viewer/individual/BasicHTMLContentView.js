import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../../utils/URIUtil';
/**
Default component to display object values
*/
class BasicHTMLContentView extends React.Component {
    render() {
        let val, outputDIV;
        let cstyle={direction: 'ltr'};
        val = this.props.spec.value;
        if(this.props.config){
            if(this.props.config.decodeURIComponent || this.props.decodeURIComponent){
                val = decodeURIComponent(val);
            }else if (this.props.config.encodeURIComponent || this.props.encodeURIComponent) {
                val = encodeURIComponent(val);
            }
            //allow view RightToLeft languages
            if (this.props.config.rtl || this.props.rtl) {
                cstyle.direction= 'rtl';
            }
        }
        outputDIV = <div itemProp={this.props.property} dangerouslySetInnerHTML={{__html: val}} />;
        return (
            <div className="ui" style={cstyle} ref="basicHTMLContentView">
                {outputDIV}
            </div>
        );
    }
}
BasicHTMLContentView.propTypes = {
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default BasicHTMLContentView;
