import React from 'react';
import {NavLink} from 'fluxible-router';
import URIUtil from '../../../utils/URIUtil';
class BasicLinkedIndividualView extends React.Component {
    render() {
        let outputDIV, val = this.props.spec.value;
        let graphName = this.props.graphName;
        if(this.props.config){
            if(this.props.config.linkedGraph){
                graphName = this.props.config.linkedGraph[0];
            }
            if(this.props.config.shortenURI){
                val = URIUtil.getURILabel(val);
                if(!val){
                    val = this.props.spec.value;
                }
            }
        }
        outputDIV = <NavLink routeName="resource" className="ui label" href={'/dataset/' + encodeURIComponent(graphName) + '/resource/' + encodeURIComponent(this.props.spec.value) + '/' + this.props.category + '/' + encodeURIComponent(this.props.propertyPath)}>
            <i className="black cube icon"></i> {val}
                    </NavLink>;
        return (
            <div className="ui" ref="basicLinkedIndividualView">
                {outputDIV}
            </div>
        );
    }
}

export default BasicLinkedIndividualView;
