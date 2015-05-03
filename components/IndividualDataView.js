import React from 'react';
import BasicIndividualView from './BasicIndividualView';

class IndividualDataView extends React.Component {
    render() {
        let viewer;
        switch(this.props.config? (this.props.config.viewer? this.props.config.viewer[0]:'') : ''){
            case 'BasicIndividualView':
                viewer = <BasicIndividualView spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                viewer = <BasicIndividualView spec={this.props.spec} config={this.props.config}/>;
        }
        return (
            <div className="ui">
                {viewer}
            </div>
        );
    }
}

export default IndividualDataView;
