import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../../utils/URIUtil';
import ReactMarkdown from 'react-markdown';
/**
The component to display Markdown values
*/
class MarkdownView extends React.Component {
    render() {
        let val, outputDIV;
        val = this.props.spec.value;
        if(this.props.config){
            if(this.props.config.decodeURIComponent || this.props.decodeURIComponent){
                val = decodeURIComponent(val);
            }
        }
        outputDIV = <ReactMarkdown itemProp={this.props.property} source={val} />;
        return (
            <div className="ui" ref="markdownView">
                {outputDIV}
            </div>
        );
    }
}
MarkdownView.propTypes = {
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default MarkdownView;
