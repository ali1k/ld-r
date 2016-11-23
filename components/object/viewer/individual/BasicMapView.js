import React from 'react';
import Wkt from 'wicket/wicket';
import LeafletMapView from '../common/LeafletMapView';
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
        outputDIV = <span> {val} </span>;
        //identify the type of geo shape
        if (val.indexOf('POLYGON') !== -1 || val.indexOf('Polygon') !== -1 || val.indexOf('MULTIPOLYGON') !== -1 || val.indexOf('MultiPolygon') !== -1 || val.indexOf('LineString') !== -1 || val.indexOf('MultiLineString') !== -1) {
            let wkt = new Wkt.Wkt();
            wkt.read(val);
            if(wkt.components && wkt.components.length && wkt.components[0].length){
                zoomLevel = 8;
                if(this.props.zoomLevel){
                    zoomLevel = this.props.zoomLevel;
                }
                try {
                    let focusPoint = {lat: parseFloat(wkt.components[0][0].y), lng: parseFloat(wkt.components[0][0].x)};
                    if(!focusPoint.lat || focusPoint.lat==='NaN' || !focusPoint.lng || focusPoint.lng==='NaN'){
                        focusPoint = {lat: parseFloat(wkt.components[0][1].y), lng: parseFloat(wkt.components[0][1].x)};
                    }
                    outputDIV = <LeafletMapView key={'shape'} geometry={[wkt.toJson()]} zoomLevel={zoomLevel} center={focusPoint} />;
                }
                catch(err) {
                    console.log(err.message);
                    outputDIV = <span> {val} </span>;
                }
            }
        }else{
            if(this.props.zoomLevel){
                zoomLevel = this.props.zoomLevel;
            }
            //default is a POINT
            val = val.replace('POINT(', '').replace(')', '');
            coordinates = val.split(' ');
            long = parseFloat(coordinates[0]);
            lat = parseFloat(coordinates[1]);
            if((this.props.config && this.props.config.swapLongLat) || this.props.swapLongLat){
                long = parseFloat(coordinates[1]);
                lat = parseFloat(coordinates[0]);
            }
            if(coordinates.length){
                outputDIV = <LeafletMapView key={this.props.spec.value} markers={[{position: {lat: lat, lng: long}, key: this.props.spec.value}]} zoomLevel={zoomLevel} center={{lat: lat, lng: long}}/>;
            }
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
