import React from 'react';
import PropTypes from 'prop-types';
import Wkt from 'wicket/wicket';
import LeafletMapView from '../common/LeafletMapView';
/**
display geo coordinates (POINT or Polygons) on Map
*/
class BasicMapView extends React.Component {
    getFocusPoint(val, components) {
        let focusPoint = {lat: 52.379189, lng: 4.899431};
        if(val.indexOf('MULTIPOLYGON') !== -1 || val.indexOf('MultiPolygon') !== -1 ){
            focusPoint = {lat: parseFloat(components[0][0][0].y), lng: parseFloat(components[0][0][0].x)};
        }else if(val.indexOf('POLYGON') !== -1 || val.indexOf('Polygon') !== -1 ){
            focusPoint = {lat: parseFloat(components[0][0].y), lng: parseFloat(components[0][0].x)};
            if(!focusPoint.lat || isNaN(focusPoint.lat) || !focusPoint.lng || isNaN(focusPoint.lng)){
                focusPoint = {lat: parseFloat(components[0][1].y), lng: parseFloat(components[0][1].x)};
            }
        } else if(val.indexOf('MULTILINESTRING') !== -1 || val.indexOf('MultiLineString') !== -1 ){
            focusPoint = {lat: parseFloat(components[0][0].y), lng: parseFloat(components[0][0].x)};
        }else if(val.indexOf('LINESTRING') !== -1 || val.indexOf('LineString') !== -1 ){
            focusPoint = {lat: parseFloat(components[0].y), lng: parseFloat(components[0].x)};
        }

        return focusPoint;
    }
    render() {
        let val, outputDIV, coordinates, long, lat, shapeColor = '#1a75ff';
        val = this.props.spec.value;
        let zoomLevel = 14;
        let simplifyPolyLines, simplifyTolerance, simplifyHighQuality;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        if(this.props.config && this.props.config.shapeColor){
            shapeColor = this.props.config.shapeColor;
        }
        let mapHeight, mapWidth;
        if(this.props.config){
            if(this.props.config.mapHeight){
                mapHeight = this.props.config.mapHeight;
            }
            if(this.props.config.mapWidth){
                mapWidth = this.props.config.mapWidth;
            }
        }
        outputDIV = <span> {val} </span>;
        //identify the type of geo shape
        if (val.indexOf('POLYGON') !== -1 || val.indexOf('Polygon') !== -1 || val.indexOf('MULTIPOLYGON') !== -1 || val.indexOf('MultiPolygon') !== -1 || val.indexOf('LineString') !== -1 || val.indexOf('MultiLineString') !== -1) {
            let wkt = new Wkt.Wkt();
            wkt.read(val);
            if(wkt.components && wkt.components.length && wkt.components[0].length){
                zoomLevel = 7;
                if(this.props.config && this.props.config.zoomLevel){
                    zoomLevel = this.props.config.zoomLevel;
                }
                if(this.props.zoomLevel){
                    zoomLevel = this.props.zoomLevel;
                }
                if(this.props.config){
                    if( this.props.config.simplifyPolyLines){
                        simplifyPolyLines = this.props.config.simplifyPolyLines;
                    }
                    if( this.props.config.simplifyTolerance){
                        simplifyTolerance = this.props.config.simplifyTolerance;
                    }
                    if( this.props.config.simplifyHighQuality){
                        simplifyHighQuality = this.props.config.simplifyHighQuality;
                    }
                }
                if(this.props.simplifyPolyLines){
                    simplifyPolyLines = this.props.simplifyPolyLines;
                }
                if(this.props.simplifyTolerance){
                    simplifyTolerance = this.props.simplifyTolerance;
                }
                if(this.props.simplifyHighQuality){
                    simplifyHighQuality = this.props.simplifyHighQuality;
                }

                try {
                    let focusPoint = this.getFocusPoint(val, wkt.components);
                    outputDIV = <LeafletMapView key={'shape'} mapWidth={mapWidth} mapHeight={mapHeight} geometry={[wkt.toJson()]} zoomLevel={zoomLevel} center={focusPoint} styles={{color: shapeColor, fill:true, fillOpacity: 0.25 , opacity: 1, weight: 3, fillColor:shapeColor}} simplifyPolyLines={simplifyPolyLines} simplifyHighQuality={simplifyHighQuality} simplifyTolerance={simplifyTolerance}/>;
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
            if(val.indexOf('POINT') ===  -1){
                //WKN point
                coordinates = val.split(' ');
                coordinates = [coordinates[1], coordinates[0]];
            }else{
                //non-WKN point
                val = val.replace('POINT(', '').replace(')', '');
                coordinates = val.split(' ');
            }
            try {
                long = parseFloat(coordinates[0]);
                lat = parseFloat(coordinates[1]);
                if((this.props.config && this.props.config.swapLongLat) || this.props.swapLongLat){
                    long = parseFloat(coordinates[1]);
                    lat = parseFloat(coordinates[0]);
                }
                if(isNaN(long) || isNaN(lat)){
                    outputDIV = <span> {val} </span>;
                }else{
                    if(coordinates.length){
                        outputDIV = <LeafletMapView key={this.props.spec.value} mapWidth={mapWidth} mapHeight={mapHeight} markers={[{position: {lat: lat, lng: long}, key: this.props.spec.value}]} zoomLevel={zoomLevel} center={{lat: lat, lng: long}}/>;
                    }
                }

            }
            catch(err) {
                console.log(err.message);
                outputDIV = <span> {val} </span>;
            }
        }
        return (
            <div className="ui" ref="basicMapView" itemProp={this.props.property}>
                {outputDIV}
            </div>
        );
    }
}
BasicMapView.propTypes = {
    /**
    Height of the Map
    */
    mapHeight: PropTypes.number,
    /**
    Width of the Map
    */
    mapWidth: PropTypes.number,
    /**
    Used to customize the color of shape on the map
    */
    shapeColor: PropTypes.string,
    /**
    Swap longitude and latitudes: default is POINT(long lat)
    */
    swapLongLat: PropTypes.bool,
    /**
    Default level of zoom on the map
    */
    zoomLevel: PropTypes.number,
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default BasicMapView;
