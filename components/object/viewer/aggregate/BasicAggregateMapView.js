import React from 'react';
import GoogleMapView from '../common/GoogleMapView';

class BasicAggregateMapView extends React.Component {
    render() {
        let val, outputDIV, coordinates, coordinatesArr=[];
        let zoomLevel = 8;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        this.props.spec.instances.forEach((node, index)=> {
            if(!node){
                return undefined; // stop processing this iteration
            }
            if(node.valueType === 'typed-literal' && node.dataType==='http://www.openlinksw.com/schemas/virtrdf#Geometry'){
                val = node.value.replace('POINT(', '').replace(')', '');
                coordinates = val.split(' ');
                coordinatesArr.push({position: {lat: parseFloat(coordinates[1]), lng: parseFloat(coordinates[0])}, key: node.value});
            }
        });
        return (
            <div className="ui" ref="basicAggregateMapView">
                <GoogleMapView key="bamv" markers={coordinatesArr} zoomLevel={zoomLevel} center={{lat: coordinatesArr[0].position.lat, lng: coordinatesArr[0].position.lng}}/>
            </div>
        );
    }
}

export default BasicAggregateMapView;
