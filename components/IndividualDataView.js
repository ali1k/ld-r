import React from 'react';
import BasicIndividualView from './BasicIndividualView';
import BasicIndividualDetailView from './BasicIndividualDetailView';
import BasicDBpediaView from './BasicDBpediaView';

class IndividualDataView extends React.Component {
    render() {
        let viewer, extendedViewer, output;
        if(this.props.spec.extendedViewData){
            //go to extended view
            switch(this.props.config? (this.props.config.extendedViewer? this.props.config.extendedViewer[0]:'') : ''){
                case 'BasicIndividualDetailView':
                    extendedViewer = <BasicIndividualDetailView spec={this.props.spec} config={this.props.config}/>;
                break;
                default:
                    extendedViewer = <BasicIndividualDetailView spec={this.props.spec} config={this.props.config}/>;
            }
            output = extendedViewer;
        }else{
            //go to normal view
            switch(this.props.config? (this.props.config.viewer? this.props.config.viewer[0]:'') : ''){
                case 'BasicIndividualView':
                    viewer = <BasicIndividualView spec={this.props.spec} config={this.props.config}/>;
                break;
                case 'BasicDBpediaView':
                    viewer = <BasicDBpediaView asWikipedia="1" spec={this.props.spec} config={this.props.config}/>;
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
