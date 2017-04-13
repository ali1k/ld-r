import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../../utils/URIUtil';
/**
Display on and off switch for boolean object values
*/
class ToggleView extends React.Component {
    render() {
        let val;
        let onValue = '1';
        let offValue = '0';
        if(this.props.config){
            if(this.props.config.onValue){
                onValue = this.props.config.onValue;
            }
            if(this.props.onValue){
                onValue = this.props.onValue;
            }
            if(this.props.config.offValue){
                offValue = this.props.config.offValue;
            }
            if(this.props.offValue){
                offValue = this.props.offValue;
            }
        }
        val = this.props.spec.value;
        return (
            <div ref="toggleView">
                {(String(val) !== String(onValue)) ? val : ''}
                <div className="ui fitted toggle read-only checkbox" title={val}>
                  <input type="checkbox" defaultChecked={(String(val) === String(onValue))}/>
                  <label>{val}</label>
                </div>
                {(String(val) === String(onValue)) ? val : ''}
            </div>
        );
    }
}
ToggleView.propTypes = {
    /**
    Value on on (checked) mode
    */
    onValue: PropTypes.string,
    /**
    value on off (unchecked) mode
    */
    offValue: PropTypes.string,
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default ToggleView;
