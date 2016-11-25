import React from 'react';
import { render } from 'react-dom';
class LeafletMapView extends React.Component {
    constructor(...args) {
        super(...args);
    }
    styleGeoJSON(feature){
        return {color: feature.style.color};
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
                const colors = ['#1a75ff', '#0bc4a7', '#1a48eb', '#ecdc0b', '#ed1ec6', '#d9990b', '#0c0d17', '#e3104f', '#6d8ecf'];
                let style, features = [];
                self.props.geometry.forEach((geo, index)=> {
                    style = self.props.styles;
                    if(!style){
                        style={color: colors[index % colors.length]};
                    }
                    features.push({'type': 'Feature', 'id': index, 'style': style, 'properties': {'name': index}, 'geometry': geo});
                })
                let geojson= {'type':'FeatureCollection','features': features};
                //console.log(JSON.stringify(geojson));
                outputDIV2 = <GeoJSON data={geojson} style={self.styleGeoJSON}/>;
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
