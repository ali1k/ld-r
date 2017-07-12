import React from 'react';
import { Renderer, Camera, Scene } from 'react-threejs';
import PropTypes from 'prop-types';
import {connectToStores} from 'fluxible-addons-react';
import Dataset3DStore from '../../stores/Dataset3DStore';

class Dataset3D extends React.Component {
    constructor(props){
        super(props);
    }
    componentDidMount() {
        //call actions to retrieve different characteristics of a dataset
        //Class Names -> their total number of instances
        //Class Names -> max number of properties


    }
    render() {

        let self = this;
        return (
            <div className="ui fluid container ldr-padding-more" ref="dataset#D">
                <div className="ui grid">
                    <div className="ui column">
                        Dataset3D Component
                        <Renderer size={rendererSize}>
                            <Camera position={{ z: 5 }} />
                            <Scene>
                                <MyCube color={0x00ff00} rotation={rotation}>
                                    <MyCube color={0xff0000} position={{ y: 2 }} />
                                    <MyCube color={0x0000ff} position={{ z: 3 }} />
                                </MyCube>
                            </Scene>
                        </Renderer>)
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
