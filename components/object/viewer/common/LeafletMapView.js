import React from 'react';
import { render } from 'react-dom';
class LeafletMapView extends React.Component {
    constructor(...args) {
        super(...args);
    }
    render() {
        let self = this;
        if (process.env.BROWSER) {
            let {Map, Marker, Popup, TileLayer} = require('react-leaflet');
            return (
                <Map ref='map' center={[self.props.center.lat, self.props.center.lng]} zoom={self.props.zoomLevel} style={{minHeight: 200, minWidth: 200}}>
                   <TileLayer style={{height: '200px', position: 'relative'}}
                     url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                     attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                   />
                    {
                        self.props.markers.map((marker, index)=> {
                            return (
                                <Marker key={index} position={[marker.position.lat, marker.position.lng]}>
                                    <Popup>
                                        <span>{marker.position.lat}, {marker.position.lng}</span>
                                    </Popup>
                                </Marker>
                            );
                        })
                    }
                </Map>
            );
        }else {
            return (<div></div>);
        }

    }
}

export default LeafletMapView;
