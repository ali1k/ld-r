import React from 'react';
import PropTypes from 'prop-types';
import {connectToStores} from 'fluxible-addons-react';
import Dataset3DStore from '../../stores/Dataset3DStore';
import * as THREE from 'three';
import React3 from 'react-three-renderer';
import ReactDOM from 'react-dom';
import getClassFrequency from '../../actions/getClassFrequency';

class Dataset3D extends React.Component {
    constructor(props){
        super(props);
        // construct the position vector here, because if we use 'new' within render,
        // React will think that things have changed when they have not.
        this.cameraPosition = new THREE.Vector3(0, 0, 5);

        this.state = {
            cubeRotation: new THREE.Euler(),
        };

        this._onAnimate = () => {
            // we will get this callback every frame

            // pretend cubeRotation is immutable.
            // this helps with updates and pure rendering.
            // React will be sure that the rotation has now updated.
            this.setState({
                cubeRotation: new THREE.Euler(
                    this.state.cubeRotation.x + 0.1,
                    this.state.cubeRotation.y + 0.1,
                    0
                ),
            });
        };
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
        //const width = window.innerWidth; // canvas width
        //const height = window.innerHeight; // canvas height
        const width = 800; // canvas width
        const height = 600; // canvas height

        //console.log(this.props.Dataset3DStore.dataset.classes);
        let self = this;
        return (
            <div className="ui fluid container ldr-padding-more" ref="dataset#D">
                <div className="ui grid">
                    <div className="ui column">
                        Dataset3D Component
                        <React3
                            mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
                            width={width}
                            height={height}
                            onAnimate={this._onAnimate}>
                            <scene>
                                <perspectiveCamera
                                    name="camera"
                                    fov={75}
                                    aspect={width / height}
                                    near={0.1}
                                    far={1000}
                                    position={this.cameraPosition}
                                />
                                <mesh
                                    rotation={this.state.cubeRotation}
                                >
                                    <boxGeometry
                                        width={1}
                                        height={1}
                                        depth={1}
                                    />
                                    <meshBasicMaterial
                                        color={0x00ff00}
                                    />
                                </mesh>
                            </scene>
                        </React3>
                        {JSON.stringify(this.props.Dataset3DStore.dataset.classes)}
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
