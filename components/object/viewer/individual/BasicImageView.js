import React from 'react';
import PropTypes from 'prop-types';
/**
display image for image URIs
*/
class BasicImageView extends React.Component {
    render() {
        let val, outputDIV;
        let styleCl = {maxWidth: '400px'};
        val = this.props.spec.value;
        if(this.props.config){
            if(this.props.config.imageHeight || this.props.imageHeight){
                styleCl['height'] = this.props.config.imageHeight;
            }
            if(this.props.config.imageWidth || this.props.imageWidth){
                styleCl['width'] = this.props.config.imageWidth;
            }
        }
        if(this.props.spec.valueType === 'uri' || val.indexOf('http:') !== -1){
            outputDIV = <a href={val} target="_blank"> <img className="ui centered rounded image" style={styleCl} src={val} alt={val} /> </a>;
        }else{
            outputDIV = <span> {val} </span>;
        }
        return (
            <div className="ui" ref="basicImageView">
                {outputDIV}
            </div>
        );
    }
}
BasicImageView.propTypes = {
    /**
    Width of the image
    */
    imageWidth: PropTypes.number,
    /**
    Height of the image
    */
    imageHeight: PropTypes.number,
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default BasicImageView;
