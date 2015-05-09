import React from 'react';
import BasicIndividualView from './BasicIndividualView';
import BasicIndividualDetailView from './BasicIndividualDetailView';
import BasicDBpediaView from './BasicDBpediaView';
import BasicLinkedIndividualView from './BasicLinkedIndividualView';
import LanguageView from './LanguageView';
import BasicOptionView from './BasicOptionView';

class IndividualDataView extends React.Component {
    render() {
        let viewer, viewerConfig = '', extendedViewer, extendedViewerConfig = '', output;
        if(this.props.config){
            if(this.props.config.extendedViewer){
                extendedViewerConfig = this.props.config.extendedViewer[0];
            }
            if(this.props.config.viewer){
                viewerConfig = this.props.config.viewer[0];
                //in case of Aggregate nature, can consider viewerI
                if(this.props.config.reactorType && this.props.config.reactorType[0]==='AggregateObjectReactor' && this.props.config.viewerI){
                    viewerConfig = this.props.config.viewerI[0];
                }
            }
        }
        if(this.props.spec.extendedViewData){
            //go to extended view
            switch(extendedViewerConfig){
                case 'BasicIndividualDetailView':
                    extendedViewer = <BasicIndividualDetailView spec={this.props.spec} config={this.props.config}/>;
                break;
                default:
                    extendedViewer = <BasicIndividualDetailView spec={this.props.spec} config={this.props.config}/>;
            }
            output = extendedViewer;
        }else{
            //go to normal view
            switch(viewerConfig){
                case 'BasicIndividualView':
                    viewer = <BasicIndividualView spec={this.props.spec} config={this.props.config}/>;
                break;
                case 'BasicLinkedIndividualView':
                    viewer = <BasicLinkedIndividualView graphName={this.props.graphName} spec={this.props.spec} config={this.props.config}/>;
                break;
                case 'BasicDBpediaView':
                    viewer = <BasicDBpediaView asWikipedia="1" spec={this.props.spec} config={this.props.config}/>;
                break;
                case 'LanguageView':
                    viewer = <LanguageView spec={this.props.spec} config={this.props.config}/>;
                break;
                case 'BasicOptionView':
                    viewer = <BasicOptionView spec={this.props.spec} config={this.props.config}/>;
                break;
                default:
                    viewer = <BasicIndividualView spec={this.props.spec} config={this.props.config}/>;
            }
            output = viewer;
        }
        return (
            <div className="ui secondary segment" ref="individualDataView">
                {output}
            </div>
        );
    }
}

export default IndividualDataView;
