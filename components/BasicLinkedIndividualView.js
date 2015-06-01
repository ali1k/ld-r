import React from 'react';
import {NavLink} from 'fluxible-router';

class BasicLinkedIndividualView extends React.Component {
    render() {
        let outputDIV, val = this.props.spec.value;
        if(this.props.spec.valueType === 'uri'){
            outputDIV = <NavLink routeName="resource" className="ui label" href={'/dataset/' + encodeURIComponent(this.props.graphName) + '/resource/' + encodeURIComponent(val)} >
                <i className="black cube icon"></i> {val}
                        </NavLink>;
        }else{
            outputDIV = <span> {val} </span>;
        }
        return (
            <div className="ui" ref="basicLinkedIndividualView">
                {outputDIV}
            </div>
        );
    }
}

export default BasicLinkedIndividualView;
