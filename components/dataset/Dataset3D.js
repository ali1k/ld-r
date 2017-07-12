import React from 'react';
import PropTypes from 'prop-types';
import {connectToStores} from 'fluxible-addons-react';
import Dataset3DStore from '../../stores/Dataset3DStore';
import getClassFrequency from '../../actions/getClassFrequency';

class Dataset3D extends React.Component {
    constructor(props){
        super(props);
    }
    componentDidMount() {
        //call actions to retrieve different characteristics of a dataset
        //Class Names -> their total number of instances
        //Class Names -> max number of properties
        this.context.executeAction(getClassFrequency, {
            id: this.props.datasetURI
        });

    }
    render() {

        let self = this;
        return (
            <div className="ui fluid container ldr-padding-more" ref="dataset#D">
                <div className="ui grid">
                    <div className="ui column">
                        Dataset3D Component
                    </div>
                </div>
            </div>
        );
    }
}
Dataset3D.contextTypes = {
    executeAction: PropTypes.func.isRequired
};
Dataset3D = connectToStores(Dataset3D, [Dataset3DStore], function (context, props) {
    return {
        Dataset3DStore: context.getStore(Dataset3DStore).getState()
    };
});
export default Dataset3D;
