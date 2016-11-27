import React from 'react';
import { render } from 'react-dom';
class LeafletMapView extends React.Component {
    constructor(...args) {
        super(...args);
    }
    styleGeoJSON(feature){
        return {color: feature.style.color, fill:feature.style.fill, fillColor:feature.style.fillColor, fillOpacity:feature.style.fillOpacity, opacity: feature.style.opacity, weight: feature.style.weight};
    }
    //hex — a hex color value such as “#abc” or “#123456” (the hash is optional)
    //lum — the luminosity factor, i.e. -0.1 is 10% darker, 0.2 is 20% lighter, etc.
    colorLuminance(hex, lum) {
        // validate hex string
    	hex = String(hex).replace(/[^0-9a-f]/gi, '');
    	if (hex.length < 6) {
    		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    	}
    	lum = lum || 0;
    	// convert to decimal and change luminosity
    	let rgb = '#', c, i;
    	for (i = 0; i < 3; i++) {
    		c = parseInt(hex.substr(i*2,2), 16);
    		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    		rgb += ('00'+c).substr(c.length);
    	}
        return rgb;
    }
    render() {
        let self = this;
        if (process.env.BROWSER) {
            let outputDIV, outputDIV1,outputDIV2;
            let {Map, Marker, Popup, TileLayer, GeoJSON} = require('react-leaflet');
            if(self.props.markers && self.props.markers.length){
                outputDIV1 = self.props.markers.map((marker, index)=> {
                    return (
                        <Marker key={index} position={[marker.position.lat, marker.position.lng]}>
                            <Popup>
                                <span>{marker.position.lat}, {marker.position.lng}</span>
                            </Popup>
                        </Marker>
                    );
                })
            }
            if(self.props.geometry && self.props.geometry.length){
                let colors = ['#1a48eb'];
                if(self.props.multiColor){
                    colors = ['#1a75ff', '#0bc4a7', '#1a48eb', '#ecdc0b', '#ed1ec6', '#d9990b', '#0c0d17', '#e3104f', '#6d8ecf'];
                }
                let style, features = [], weights=[];
                if(self.props.weights){
                    weights = self.props.weights;
                }
                self.props.geometry.forEach((geo, index)=> {
                    style = self.props.styles;
                    if(!style){
                        style={fill:true, fillOpacity: 0.25 , opacity: 1, weight: 3, fillColor:self.colorLuminance(colors[index % colors.length], (weights[index] ? (1-weights[index]) : 0.25)), color: self.colorLuminance(colors[index % colors.length], (weights[index] ? (1-weights[index]) : 0.25))};
                    }
                    features.push({'type': 'Feature', 'id': index, 'style': style, 'properties': {'name': index, }, 'geometry': geo});
                })
                let geojson= {'type':'FeatureCollection','features': features};
                //console.log(JSON.stringify(geojson));
                outputDIV2 = <GeoJSON data={geojson} style={self.styleGeoJSON} />;
            }
            if(outputDIV1){
                outputDIV = outputDIV1;
            }
            if(outputDIV2){
                outputDIV = outputDIV2;
            }
            if(outputDIV1 && outputDIV2){
                outputDIV = outputDIV1+outputDIV2;
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
                    {outputDIV}
                </Map>
            );
        }else {
            return (<div></div>);
        }

    }
}

export default LeafletMapView;
