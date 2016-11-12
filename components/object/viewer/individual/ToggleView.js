import React from 'react';
import URIUtil from '../../../utils/URIUtil';

/*
onValue: ['1'],
offValue: ['0']
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
            if(this.props.config.offValue){
                offValue = this.props.config.offValue;
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

export default ToggleView;
