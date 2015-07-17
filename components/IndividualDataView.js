import React from 'react';
import BasicIndividualView from './BasicIndividualView';
import BasicIndividualDetailView from './BasicIndividualDetailView';
import BasicDBpediaView from './BasicDBpediaView';
import BasicLinkedIndividualView from './BasicLinkedIndividualView';
import BasicOptionView from './BasicOptionView';
import PasswordView from './PasswordView';
import {LanguageView} from 'ld-r-components';
import {TwoLetterCountryView} from 'ld-r-components';

class IndividualDataView extends React.Component {
    render() {
        let category = 0, propertyPath = [], viewer, viewerConfig = '', extendedViewer, extendedViewerConfig = '';
        if(this.props.config){
            if(this.props.config.extendedViewer){
                extendedViewerConfig = this.props.config.extendedViewer[0];
            }
            if(this.props.config.viewer){
                viewerConfig = this.props.config.viewer[0];
                //in case of Aggregate nature, can consider viewerI
                if(this.props.config.objectReactorType && this.props.config.objectReactorType[0] === 'AggregateObjectReactor' && this.props.config.viewerI){
                    viewerConfig = this.props.config.viewerI[0];
                }
            }
        }
        if(this.props.spec.extendedViewData){
            //go to extended view
            switch(extendedViewerConfig){
                case 'BasicIndividualDetailView':
                    extendedViewer = <BasicIndividualDetailView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
                break;
                default:
                    extendedViewer = <BasicIndividualDetailView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
            }
        }
        //always go for linked view when it has extensions
        if(this.props.config && this.props.config.allowExtension && this.props.spec.extended){
            viewerConfig = 'BasicLinkedIndividualView';
            propertyPath = [this.props.resource, this.props.property];
        }
        if(this.props.config && this.props.config.category){
            category = this.props.config.category;
        }
        //go to normal view
        switch(viewerConfig){
            case 'BasicIndividualView':
                viewer = <BasicIndividualView spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'BasicLinkedIndividualView':
                viewer = <BasicLinkedIndividualView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config} propertyPath={propertyPath} category={category}/>;
            break;
            case 'PasswordView':
                viewer = <PasswordView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'BasicDBpediaView':
                viewer = <BasicDBpediaView spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'LanguageView':
                viewer = <LanguageView spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'BasicOptionView':
                viewer = <BasicOptionView spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'TwoLetterCountryView':
                viewer = <TwoLetterCountryView spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                viewer = <BasicIndividualView spec={this.props.spec} config={this.props.config}/>;
        }
        //check if it has a blank node value config
        let hideObject = 0;
        if(this.props.config && this.props.config.hasBlankNode && extendedViewer){
            hideObject = 1;
        }
        return (
            <div className="ui" ref="individualDataView">
                {hideObject ? <span itemProp={this.props.property}></span> : <div itemProp={this.props.property} className="ui attached secondary segment"> {viewer} </div>}
                {extendedViewer}
            </div>
        );
    }
}

export default IndividualDataView;
