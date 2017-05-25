import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'fluxible-router';
import URIUtil from '../../../utils/URIUtil';
/**
display object with link to its correspondig resource page on LD-R
*/
class BasicLinkedIndividualView extends React.Component {
    render() {
        let outputDIV, val = this.props.spec.value;
        let datasetURI = this.props.datasetURI;
        if(this.props.config){
            if(this.props.config.containerDatasetURI || this.props.containerDatasetURI){
                datasetURI = this.props.config.containerDatasetURI[0];
            }
            if(this.props.config.shortenURI || this.props.shortenURI){
                val = URIUtil.getURILabel(val);
                if(!val){
                    val = this.props.spec.value;
                }
            }
        }
        let title = val;
        if(this.props.spec.valueLabel){
            title = this.props.spec.valueLabel;
        }
        if(this.props.spec.valueTitle){
            title = this.props.spec.valueTitle;
        }
        if(this.props.openInNewWindows || (this.props.config && this.props.config.openInNewWindows)){
            outputDIV = <a target="_blank" className="ui label" href={'/dataset/' + encodeURIComponent(datasetURI) + '/resource/' + encodeURIComponent(this.props.spec.value) + '/' + this.props.category + '/' + encodeURIComponent(this.props.propertyPath)}>
                <i className="black cube icon"></i> {title}
                </a>;
        }else{
            outputDIV = <NavLink routeName="resource" className="ui label" href={'/dataset/' + encodeURIComponent(datasetURI) + '/resource/' + encodeURIComponent(this.props.spec.value) + '/' + this.props.category + '/' + encodeURIComponent(this.props.propertyPath)}>
                <i className="black cube icon"></i> {title}
                        </NavLink>;
        }

        return (
            <div className="ui" ref="basicLinkedIndividualView">
                <a itemProp={this.props.property} style={{display: 'none'}} href={this.props.spec.value}></a>
                {outputDIV}
            </div>
        );
    }
}
BasicLinkedIndividualView.propTypes = {
    /**
    Opens the link in a new windows
    */
    openInNewWindows: PropTypes.bool,
    /**
    Container dataset URI
    */
    containerDatasetURI: PropTypes.string,
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default BasicLinkedIndividualView;
