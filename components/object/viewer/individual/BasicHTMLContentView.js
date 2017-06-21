import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../../utils/URIUtil';
/**
Default component to display object values
*/
class BasicHTMLContentView extends React.Component {
    render() {
        let val, outputDIV;
        val = this.props.spec.value;
        outputDIV = <div itemProp={this.props.property} dangerouslySetInnerHTML={{__html: val}} />;
        return (
            <div className="ui" ref="basicIndividualView">
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
