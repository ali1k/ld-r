import React from 'react';
class BasicImageView extends React.Component {
    render() {
        let val, outputDIV;
        val = this.props.spec.value;
        if(this.props.spec.valueType === 'uri'){
            outputDIV = <a href={val} target="_blank"> <img className="ui centered rounded image" style={{maxWidth: '400'}} src={val} alt={val} /> </a>;
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
