import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Dropdown, Menu } from 'semantic-ui-react'
import createNewReactorConfig from '../../actions/createNewReactorConfig';

class PropertyHeader extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    createRConfig(scope) {
        this.context.executeAction(createNewReactorConfig, {
            scope: scope,
            dataset: this.props.datasetURI,
            resourceURI: this.props.resourceURI,
            propertyURI: this.props.propertyURI,
            redirect: 1
        });
    }
    render() {
        let self = this;
        let outputDIV, hintDIV='', titleDIV, configDIV='';
        let label = this.props.spec.property;
        if(this.props.config && this.props.config.label){
            label = this.props.config.label;
        }
        titleDIV = <a style={{color:'rgb(98, 91, 95)'}} href={this.props.spec.propertyURI} target="_blank"> {label} </a>;
        if(this.props.config && this.props.config.hint){
            hintDIV = <Popup trigger={<i className="item circle info icon link"></i>} content={this.props.config.hint[0]} wide position='right center' />;
        }
        if(this.props.config && this.props.config.allowInlineConfig){
            configDIV = <Dropdown trigger={<span className="ui circular icon black button mini"><i className="ui settings icon"></i></span>} icon={null}>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={self.createRConfig.bind(self, 'P')}> Add 'P' Config</Dropdown.Item>
                    <Dropdown.Item onClick={self.createRConfig.bind(self, 'DP')}>Add 'DP' Config</Dropdown.Item>
                    <Dropdown.Item onClick={self.createRConfig.bind(self, 'RP')}>Add 'RP' Config</Dropdown.Item>
                    <Dropdown.Item onClick={self.createRConfig.bind(self, 'DRP')}> Add 'DRP' Config</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>;
        }
        switch(this.props.size){
            case '1':
                outputDIV = <h1> {titleDIV} {hintDIV} {configDIV}</h1>;
                break;
            case '2':
                outputDIV = <h2> {titleDIV} {hintDIV} {configDIV}</h2>;
                break;
            case '3':
                outputDIV = <h3> {titleDIV} {hintDIV} {configDIV}</h3>;
                break;
            case '4':
                outputDIV = <h4> {titleDIV} {hintDIV} {configDIV}</h4>;
                break;
            case '5':
                outputDIV = <h5> {titleDIV} {hintDIV} {configDIV}</h5>;
                break;
            case '6':
                outputDIV = <h6> {titleDIV} {hintDIV} {configDIV}</h6>;
                break;
            default:
                outputDIV = <h3> {titleDIV} {hintDIV} {configDIV}</h3>;
        }
        return (
            <span ref="propertyHeader">
                {outputDIV}
            </span>
        );
    }
}
PropertyHeader.contextTypes = {
    executeAction: PropTypes.func.isRequired
};
export default PropertyHeader;
