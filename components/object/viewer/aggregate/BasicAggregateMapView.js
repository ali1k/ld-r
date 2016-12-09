import React from 'react';
import Wkt from 'wicket/wicket';
import LeafletMapView from '../common/LeafletMapView';

class BasicAggregateMapView extends React.Component {
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
        let self = this;
        let val, outputDIV, coordinates, long, lat, data, coordinatesArr=[], weightArr=[], hintArr=[], shapesArr=[], focusPoint;
        let zoomLevel = 9;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        if(this.props.zoomLevel){
            zoomLevel = this.props.zoomLevel;
        }
        this.props.spec.instances.forEach((node, index)=> {
            if(!node){
                return undefined; // stop processing this iteration
            }
            if(node.weight){
                weightArr.push(node.weight);
            }
            if(node.hint){
                hintArr.push(node.hint);
            }
            if (node.value.indexOf('POLYGON') !== -1 || node.value.indexOf('Polygon') !== -1 || node.value.indexOf('MULTIPOLYGON') !== -1 || node.value.indexOf('MultiPolygon') !== -1 || node.value.indexOf('LineString') !== -1 || node.value.indexOf('MultiLineString') !== -1) {
                let wkt = new Wkt.Wkt();
                wkt.read(node.value);

                if(wkt.components && wkt.components.length && wkt.components[0].length){
                    zoomLevel = 8;
                    if(this.props.zoomLevel){
                        zoomLevel = this.props.zoomLevel;
                    }
                    try {
                        if(!focusPoint){
                            focusPoint = self.getFocusPoint(node.value, wkt.components);
                        }
                        shapesArr.push(wkt.toJson());
                    }
                    catch(err) {
                        console.log(err.message);
                    }
                }
            }else{
                //default is a POINT
                if(node.value.indexOf('POINT') ===  -1){
                    //WKN point
                    coordinates = node.value.split(' ');
                    coordinates = [coordinates[1], coordinates[0]];
                }else{
                    //non-WKN point
                    val = node.value.replace('POINT(', '').replace(')', '');
                    coordinates = val.split(' ');
                }
                try {
                    long = parseFloat(coordinates[0]);
                    lat = parseFloat(coordinates[1]);
                    if((self.props.config && self.props.config.swapLongLat) || self.props.swapLongLat){
                        long = parseFloat(coordinates[1]);
                        lat = parseFloat(coordinates[0]);
                    }
                    if(isNaN(long) || isNaN(lat)){
                        //error
                    }else{
                        coordinatesArr.push({position: {lat: lat, lng: long}, key: node.value});
                    }

                }
                catch(err) {
                    console.log(err.message);
                }

            }

        });
        let center;
        if(coordinatesArr.length){
            center = {lat: coordinatesArr[0].position.lat, lng: coordinatesArr[0].position.lng};
        }else{
            //for polygons
            center = focusPoint;
            zoomLevel = 7;
            if(this.props.config && this.props.config.zoomLevel){
                zoomLevel = this.props.config.zoomLevel;
            }
            if(this.props.zoomLevel){
                zoomLevel = this.props.zoomLevel;
            }
        }
        let mapHeight, mapWidth, multiColor = 0;
        if(this.props.config){
            if(this.props.mapHeight){
                mapHeight = this.props.mapHeight;
            }
            if(this.props.config.mapHeight){
                mapHeight = this.props.config.mapHeight;
            }
            if(this.props.mapWidth){
                mapWidth = this.props.mapWidth;
            }
            if(this.props.config.mapWidth){
                mapWidth = this.props.config.mapWidth;
            }
            if(this.props.multiColor){
                multiColor = this.props.multiColor;
            }
            if(this.props.config.multiColor){
                multiColor = this.props.config.multiColor;
            }
        }
        return (
            <div className="ui" ref="basicAggregateMapView">
                <LeafletMapView key="bamv" multiColor={multiColor} markers={coordinatesArr} geometry={shapesArr} hints={hintArr} weights={weightArr} zoomLevel={zoomLevel} center={center} mapWidth={mapWidth} mapHeight={mapHeight}/>
            </div>
        );
    }
}

export default BasicAggregateMapView;
