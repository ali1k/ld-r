import React from 'react';
import GoogleMapView from '../common/GoogleMapView';

class BasicAggregateMapView extends React.Component {
    render() {
        let self = this;
        let val, outputDIV, coordinates, long, lat, coordinatesArr=[];
        let zoomLevel = 8;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        this.props.spec.instances.forEach((node, index)=> {
            if(!node){
                return undefined; // stop processing this iteration
            }
            val = node.value.replace('POINT(', '').replace(')', '');
            coordinates = val.split(' ');
            long = parseFloat(coordinates[0]);
            lat = parseFloat(coordinates[1]);
            if((self.props.config && self.props.config.swapLongLat) || self.props.swapLongLat){
                long = parseFloat(coordinates[1]);
                lat = parseFloat(coordinates[0]);
            }
            coordinatesArr.push({position: {lat: lat, lng: long}, key: node.value});
        });
        return (
            <div className="ui" ref="basicAggregateMapView">
                <GoogleMapView key="bamv" markers={coordinatesArr} zoomLevel={zoomLevel} center={{lat: coordinatesArr[0].position.lat, lng: coordinatesArr[0].position.lng}}/>
            </div>
        );
    }
}

export default BasicAggregateMapView;
