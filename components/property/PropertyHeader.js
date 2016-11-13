import React from 'react';
import { Popup } from 'semantic-ui-react'

class PropertyHeader extends React.Component {
    componentDidMount() {
    }
    render() {
        let outputDIV, hintDIV, titleDIV;
        let label = this.props.spec.property;
        if(this.props.config && this.props.config.label){
            label = this.props.config.label;
        }
        titleDIV = <a style={{color:'rgb(98, 91, 95)'}} href={this.props.spec.propertyURI} target="_blank"> {label} </a>;
        if(this.props.config && this.props.config.hint){
            hintDIV = <Popup trigger={<i className="item circle info icon link"></i>} content={this.props.config.hint[0]} wide positioning='right center' />;
        }
        switch(this.props.size){
            case '1':
                outputDIV = <h1> {titleDIV} {hintDIV} </h1>;
                break;
            case '2':
                outputDIV = <h2> {titleDIV} {hintDIV} </h2>;
                break;
            case '3':
                outputDIV = <h3> {titleDIV} {hintDIV} </h3>;
                break;
            case '4':
                outputDIV = <h4> {titleDIV} {hintDIV} </h4>;
                break;
            case '5':
                outputDIV = <h5> {titleDIV} {hintDIV} </h5>;
                break;
            case '6':
                outputDIV = <h6> {titleDIV} {hintDIV} </h6>;
                break;
            default:
                outputDIV = <h3> {titleDIV} {hintDIV} </h3>;
        }
        return (
            <span ref="propertyHeader">
                {outputDIV}
            </span>
        );
    }
}

module.exports = PropertyHeader;
