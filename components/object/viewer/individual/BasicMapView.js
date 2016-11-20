import React from 'react';
import GoogleMapView from '../common/GoogleMapView';
/**
display geo coordinates (POINT) on Google Map
*/
class BasicMapView extends React.Component {
    render() {
        let val, outputDIV, coordinates, long, lat;
        val = this.props.spec.value;
        let zoomLevel = 14;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        if(this.props.zoomLevel){
            zoomLevel = this.props.zoomLevel;
        }
        val = val.replace('POINT(', '').replace(')', '');
        coordinates = val.split(' ');
        long = parseFloat(coordinates[0]);
        lat = parseFloat(coordinates[1]);
        if((this.props.config && this.props.config.swapLongLat) || this.props.swapLongLat){
            long = parseFloat(coordinates[1]);
            lat = parseFloat(coordinates[0]);
        }
        if(coordinates.length){
            outputDIV = <GoogleMapView key={this.props.spec.value} markers={[{position: {lat: lat, lng: long}, key: this.props.spec.value}]} zoomLevel={zoomLevel} center={{lat: lat, lng: long}}/>;
        }else{
            outputDIV = <span> {val} </span>;
        }
        return (
            <div className="ui" ref="basicMapView">
                {outputDIV}
            </div>
        );
    }
}
BasicMapView.propTypes = {
    /**
    Swap longitude and latitudes: default is POINT(long lat)
    */
    swapLongLat: React.PropTypes.bool,
    /**
    Default level of zoom on the map
    */
    zoomLevel: React.PropTypes.number,
    /**
    LD-R Configurations object
    */
    config: React.PropTypes.object,
    /**
    LD-R spec
    */
    spec: React.PropTypes.object
};
export default BasicMapView;
