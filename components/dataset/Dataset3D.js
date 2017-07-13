import React from 'react';
import PropTypes from 'prop-types';
import {connectToStores} from 'fluxible-addons-react';
import Dataset3DStore from '../../stores/Dataset3DStore';
import * as THREE from 'three';
import React3 from 'react-three-renderer';
import ReactDOM from 'react-dom';
import getClassFrequency from '../../actions/getClassFrequency';
import TrackballControls from '../trackball';

class Dataset3D extends React.Component {
    constructor(props){
        super(props);
        // construct the position vector here, because if we use 'new' within render,
        // React will think that things have changed when they have not.
        this.cameraPosition = new THREE.Vector3(0, 0, 5);
        this.classname1;
        this.cameraSet = false;

        this.state = {
            cubeRotation: new THREE.Euler(),
            minTimePerFrame: 0,
            rotate: true,
            wind: true,
            sphere: false,
            cameraPosition: new THREE.Vector3(0, 0, 5)
        };

        this._onAnimate = () => {
            if (this.controls)
            {
                this.controls.update();
            }
            // we will get this callback every frame

            // pretend cubeRotation is immutable.
            // this helps with updates and pure rendering.
            // React will be sure that the rotation has now updated.
            /*
            this.setState({
                cubeRotation: new THREE.Euler(
                    this.state.cubeRotation.x + 0.1,
                    this.state.cubeRotation.y + 0.1,
                    0
                ),
            });
            */
        };
    }

    componentDidMount() {
        this.context.executeAction(getClassFrequency, {
            id: this.props.datasetURI
        });
    }

    setCamera(){

        console.log('setting camera');
        //}
        //componentDidMount() {
        //call actions to retrieve different characteristics of a dataset
        //Class Names -> their total number of instances
        //Class Names -> max number of properties



        const controls = new TrackballControls(
            this.refs.mainCamera, ReactDOM.findDOMNode(this.refs.react3)
        );
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.addEventListener('change', () => {
            this.setState({
                cameraPosition: this.refs.mainCamera.position,
            });
        });

        this.controls = controls;

    }
    componentWillUnmount() {
        if (this.controls)
        {
            this.controls.dispose();
            delete this.controls;
        }
    }
    componentDidUpdate(){
        if (this.props.Dataset3DStore.dataset.classes.length && !this.cameraSet)
        {
            this.setCamera();
            this.cameraSet = true;
        }
    }
    render() {
        //const width = window.innerWidth; // canvas width
        //const height = window.innerHeight; // canvas height
        const width = 800; // canvas width
        const height = 600; // canvas height

        let classname1;
        let freq1;


        if (this.props.Dataset3DStore.dataset.classes.length)
        {
            classname1 = this.props.Dataset3DStore.dataset.classes[0].class;
            freq1 = this.props.Dataset3DStore.dataset.classes[0].frequency;

            //console.log(this.props.Dataset3DStore.dataset.classes);
            let self = this;
            return (
                <div className="ui fluid container ldr-padding-more" ref="dataset#D">
                    <div className="ui grid">
                        <div className="ui column">
                            Dataset3D Component <br />
                            Classname: {classname1}<br />
                            Frequency: {freq1}<br />
                            <React3
                                ref="react3"
                                mainCamera="mainCamera" // this points to the perspectiveCamera which has the name set to "camera" below
                                width={width}
                                height={height}
                                antialias
                                gammaInput
                                gammaOutput
                                shadowMapEnabled
                                shadowMapDebug
                                onAnimate={this._onAnimate}>
                                <scene>
                                    <perspectiveCamera
                                        name="mainCamera"
                                        ref="mainCamera"
                                        fov={75}
                                        aspect={width / height}
                                        position={this.cameraPosition}
                                        near={0.1}
                                        far={1000}
                                        lookAt={this.state.rotate ? this.scenePosition : null}
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
                                            color={0xDDDDDD}
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
        else
        {
            return(<div>Loading</div>);
        }


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
