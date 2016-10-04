import React from 'react';
class BasicImageView extends React.Component {
    render() {
        let val, outputDIV;
        let styleCl = {maxWidth: '400px'};
        val = this.props.spec.value;
        if(this.props.config){
            if(this.props.config.imageHeight){
                styleCl['height'] = this.props.config.imageHeight;
            }
            if(this.props.config.imageWidth){
                styleCl['width'] = this.props.config.imageWidth;
            }
        }
        if(this.props.spec.valueType === 'uri'){
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

export default BasicImageView;
