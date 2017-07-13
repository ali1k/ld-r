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
        this.cameraPosition = new THREE.Vector3(0, 0, 50);
        this.classname1;
        this.cameraSet = false;
        this.maxfrequency = 0;
        this.maxBuildingHeight = 0;

        //this._raycaster = new THREE.Raycaster();
        //this.lightPosition = new THREE.Vector3(20, 20, 20);
        this.lightPosition = new THREE.Vector3(0, 500, 2000);
        this.lightTarget = new THREE.Vector3(0, 0, 0);

        this.state = {
            cubeRotation: new THREE.Euler(),
            minTimePerFrame: 0,
            rotate: true,
            wind: true,
            sphere: false,
            cameraPosition: new THREE.Vector3(0, 0, 50)
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

            this.setState({
                cubeRotation: new THREE.Euler(
                    this.state.cubeRotation.x + 0.01,
                    this.state.cubeRotation.y + 0.01,
                    0
                ),
            });

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
        controls.rotateSpeed = 10.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 10.2;

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
            this.calculateMaxHeight();
            this.cameraSet = true;
        }
    }
    calculateMaxHeight(){
        this.props.Dataset3DStore.dataset.classes.push({ color: { }});
        let i=0;
        for(i; i<this.props.Dataset3DStore.dataset.classes.length; i++)
        {
            this.props.Dataset3DStore.dataset.classes[0].frequency = parseInt(this.props.Dataset3DStore.dataset.classes[0].frequency);
            console.log(this.props.Dataset3DStore.dataset.classes[i].frequency);
            if(this.maxfrequency < this.props.Dataset3DStore.dataset.classes[i].frequency)
            {this.maxfrequency = this.props.Dataset3DStore.dataset.classes[i].frequency;}
            this.props.Dataset3DStore.dataset.classes[i].color =  Math.random() * 0xffffff;
        }
        this.maxBuildingHeight = 100/this.maxfrequency;
        console.log(this.maxfrequency);
        console.log(this.maxBuildingHeight);
        console.log(this.props.Dataset3DStore.dataset.classes[0].frequency);
        console.log(this.props.Dataset3DStore.dataset.classes[0].frequency*this.maxBuildingHeight);
        console.log(this.props.Dataset3DStore.dataset.classes[0].frequency*this.maxBuildingHeight);

    }
    render() {
        //const width = window.innerWidth; // canvas width
        //const height = window.innerHeight; // canvas height
        const width = 800; // canvas width
        const height = 600; // canvas height

        //let classname0, classname1, freq0, freq1;
        //, color0, color1;

        if (this.props.Dataset3DStore.dataset.classes.length)
        {
            //classname0 = this.props.Dataset3DStore.dataset.classes[0].class;
            //freq0 = this.props.Dataset3DStore.dataset.classes[0].frequency;
            //color0 = (Math.random() * 0xffffff);
            //classname1 = this.props.Dataset3DStore.dataset.classes[1].class;
            //freq1 = this.props.Dataset3DStore.dataset.classes[1].frequency;
            //color1 = (Math.random() * 0xffffff);

            //console.log(this.props.Dataset3DStore.dataset.classes);
            let self = this;
            return (
                <div className="ui fluid container ldr-padding-more" ref="dataset#D">
                    <div className="ui grid">
                        <div className="ui column">
                            Dataset3D Component <br />
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
                                shadowMapType={THREE.PCFShadowMap}
                                sortObjects={false}
                                pixelRatio={window.devicePixelRatio}
                                clearColor={0xf0f0f0}
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
                                    <ambientLight
                                        color={0x505050}
                                    />
                                    <spotLight
                                        color={0xffffff}
                                        intensity={1.5}
                                        position={this.lightPosition}
                                        lookAt={this.lightTarget}

                                        castShadow
                                        shadowCameraNear={200}
                                        shadowCameraFar={10000}
                                        shadowCameraFov={50}

                                        shadowBias={-0.00022}

                                        shadowMapWidth={2048}
                                        shadowMapHeight={2048}
                                    />
                                    <mesh
                                        position={new THREE.Vector3(0, 0, 0)}
                                    >
                                        <boxGeometry
                                            width={1000}
                                            height={0.1}
                                            depth={1000}
                                        />
                                        <meshBasicMaterial
                                            color={0x505050}
                                        />
                                    </mesh>
                                    <mesh
                                        position={new THREE.Vector3(0, ((this.props.Dataset3DStore.dataset.classes[0].frequency*this.maxBuildingHeight)/2), 0)}
                                        castShadow
                                        receiveShadow
                                    >
                                        <boxGeometry
                                            width={1}
                                            height={this.props.Dataset3DStore.dataset.classes[0].frequency*this.maxBuildingHeight}
                                            depth={1}
                                        />
                                        <meshLambertMaterial
                                            color={this.props.Dataset3DStore.dataset.classes[0].color}
                                        />
                                    </mesh>
                                    <mesh
                                        position={new THREE.Vector3(2, ((this.props.Dataset3DStore.dataset.classes[1].frequency*this.maxBuildingHeight)/2), 0)}
                                        castShadow
                                        receiveShadow
                                    >
                                        <boxGeometry
                                            width={1}
                                            height={this.props.Dataset3DStore.dataset.classes[1].frequency*this.maxBuildingHeight}
                                            depth={1}
                                        />
                                        <meshLambertMaterial
                                            color={this.props.Dataset3DStore.dataset.classes[1].color}
                                        />
                                    </mesh>

                                    <mesh
                                        castShadow
                                        receiveShadow
                                        position={new THREE.Vector3(4, ((this.props.Dataset3DStore.dataset.classes[2].frequency*this.maxBuildingHeight)/2), 0)}
                                    >
                                        <boxGeometry
                                            width={1}
                                            height={this.props.Dataset3DStore.dataset.classes[2].frequency*this.maxBuildingHeight}
                                            depth={1}
                                        />
                                        <meshLambertMaterial
                                            color={this.props.Dataset3DStore.dataset.classes[2].color}
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
