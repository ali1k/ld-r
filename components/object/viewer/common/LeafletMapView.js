import React from 'react';
import { render } from 'react-dom';
class LeafletMapView extends React.Component {
    constructor(...args) {
        super(...args);
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
                let features = [];
                self.props.geometry.forEach((geo, index)=> {
                    features.push({'type': 'Feature', 'id': index, 'properties': {'name': index}, 'geometry': geo});

                })
                let geojson= {'type':'FeatureCollection','features': features};
                outputDIV2 = <GeoJSON data={geojson}/>;
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
            return (
                <Map ref='map' center={[self.props.center.lat, self.props.center.lng]} zoom={self.props.zoomLevel} style={{minHeight: 200, minWidth: 200}}>
                   <TileLayer style={{height: '200px', position: 'relative'}}
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
