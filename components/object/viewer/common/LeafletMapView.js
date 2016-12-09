import React from 'react';
import { render } from 'react-dom';
import chroma from 'chroma-js';

class LeafletMapView extends React.Component {
    constructor(...args) {
        super(...args);
    }
    styleGeoJSON(feature){
        return {color: feature.style.color, fill:feature.style.fill, fillColor:feature.style.fillColor, fillOpacity:feature.style.fillOpacity, opacity: feature.style.opacity, weight: feature.style.weight};
    }
    //maps values to colors
    colorMapping(weights){
        let arr1= weights;
        arr1 = arr1.filter((v, i, a) => a.indexOf(v) === i);
        arr1.sort();
        let colors = chroma.scale(['grey', 'red']).colors(arr1.length);
        let mapping = {};
        arr1.forEach((v,i)=>{
            mapping[v] = colors[i];
        })
        return mapping;
    }
    reversePolygonCoords(coords){
        let newP = [];
        coords.forEach((coord)=>{
            newP.push([coord[1], coord[0]]);
        })
        return newP;
    }
    reverseMultiPolygonCoords(coords){
        let newP = [];
        coords.forEach((coord)=>{
            newP.push(this.reversePolygonCoords(coord));
        })
        return newP;
    }
    render() {
        let self = this;
        if (process.env.BROWSER) {
            let markersDIV, geoJSONDIV, polygonsDIV, multipolygonsDIV, colorMap = {}, weights=[], hints=[];
            let {Map, Marker, Popup, TileLayer, GeoJSON, Polygon} = require('react-leaflet');
            if(self.props.hints){
                hints = self.props.hints;
            }
            if(self.props.weights){
                weights = self.props.weights;
                colorMap = self.colorMapping(weights);
            }
            if(self.props.markers && self.props.markers.length){
                markersDIV = self.props.markers.map((marker, index)=> {
                    return (
                        <Marker key={index} position={[marker.position.lat, marker.position.lng]}>
                            <Popup>
                                {hints && hints[index] ? <div dangerouslySetInnerHTML={{__html: hints[index]}} />: <span>{marker.position.lat}, {marker.position.lng}</span>}
                            </Popup>
                        </Marker>
                    );
                })
            }
            if(self.props.geometry && self.props.geometry.length){
                let colors = ['#0c0d17'];
                if(self.props.multiColor){
                    colors = ['#0c0d17', '#0bc4a7', '#1a48eb', '#ecdc0b', '#ed1ec6', '#d9990b', '#1a75ff', '#e3104f', '#3f83a3'];
                }
                let style, features = [], polygons=[], multipolygons=[];
                self.props.geometry.forEach((geo, index)=> {
                    style = self.props.styles;
                    if(!style){
                        style={fill:true, fillOpacity: 0.50 , opacity: 1, weight: 1.5, fillColor: weights[index] ? colorMap[weights[index]] : colors[index % colors.length], color: colors[index % colors.length]};
                    }
                    //separate polygons from geojson
                    if(geo.type === 'Polygon'){
                        polygons.push({style: style, coords: geo.coordinates[0], weight: weights.length ? weights[index] : 0, hint: hints.length ? hints[index] : 0})
                    }else{
                        if(geo.type === 'MultiPolygon'){
                            multipolygons.push({style: style, coords: geo.coordinates[0], weight: weights.length ? weights[index] : 0, hint: hints.length ? hints[index] : 0})
                        }else{
                            features.push({'type': 'Feature', 'id': index, 'style': style, 'properties': {'name': index}, 'geometry': geo});
                        }

                    }
                })
                polygonsDIV = polygons.map((polygon, index)=>{
                    return (
                        <Polygon color={polygon.style.color} fill={polygon.style.fill} fillOpacity={polygon.style.fillOpacity} weight={polygon.style.weight} fillColor={polygon.style.fillColor} key={index} positions={self.reversePolygonCoords(polygon.coords)}>
                            {polygon.hint ? <Popup><span dangerouslySetInnerHTML={{__html: polygon.hint}} /></Popup>: ''}
                        </Polygon>
                    );
                })
                multipolygonsDIV = multipolygons.map((mpolygon, index)=>{
                    return (
                        <Polygon color={mpolygon.style.color} fill={mpolygon.style.fill} fillOpacity={mpolygon.style.fillOpacity} weight={mpolygon.style.weight} fillColor={mpolygon.style.fillColor} key={index} positions={self.reverseMultiPolygonCoords(mpolygon.coords)}>
                            {mpolygon.hint ? <Popup><span dangerouslySetInnerHTML={{__html: mpolygon.hint}} /></Popup>: ''}
                        </Polygon>
                    );
                })
                if(features.length){
                    let geojson= {'type':'FeatureCollection','features': features};
                    //console.log(JSON.stringify(geojson));
                    geoJSONDIV = <GeoJSON data={geojson} style={self.styleGeoJSON} />;
                }
            }
            let minHeight= 210;
            let minWidth = 200;
            if(self.props.mapWidth){
                minWidth = self.props.mapWidth;
            }
            if(self.props.mapHeight){
                minHeight = self.props.mapHeight;
            }
            return (
                <Map ref='map' center={[self.props.center.lat, self.props.center.lng]} zoom={self.props.zoomLevel} style={{minHeight: minHeight, minWidth: minWidth}}>
                   <TileLayer style={{position: 'relative'}}
                     url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                     attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                   />
               {markersDIV}{polygonsDIV}{multipolygonsDIV}{geoJSONDIV}
                </Map>
            );
        }else {
            return (<div></div>);
        }

    }
}

export default LeafletMapView;
