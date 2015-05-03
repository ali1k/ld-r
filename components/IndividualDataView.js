import React from 'react';
import BasicIndividualView from './BasicIndividualView';

class IndividualDataView extends React.Component {
    render() {
        let list;
        switch(this.props.config? (this.props.config.viewer? this.props.config.viewer[0]:'') : ''){
            case 'BasicIndividualView':
                list = this.props.spec.instances.map(function(node, index) {
                    return (
                        <BasicIndividualView spec={node}/>
                    );
                });
            break;
            default:
                list = this.props.spec.instances.map(function(node, index) {
                    return (
                        <BasicIndividualView spec={node}/>
                    );
                });
        }
        return (
            <div className="ui">
                {list}
            </div>
        );
    }
}

export default IndividualDataView;
