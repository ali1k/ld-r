import React from 'react';
import {GoogleMap, Marker} from "react-google-maps";
class GoogleMapView extends React.Component {
      constructor (...args) {
        super(...args);
        this.state = {
          markers: this.props.markers
        };
      }
      toMarker (marker, index) {
        return (
          <Marker
            position={marker.position}
            key={marker.key} />
        );
      }
      render () {
        return (
          <GoogleMap containerProps={{
              style: {
                  minHeight: "200px",
                  minWidth: "200px"
              },
            }}
            ref="map"
            googleMapsApi={
              "undefined" !== typeof google ? google.maps : null
            }
            zoom={this.props.zoomLevel}
            center={this.props.center} >
            {this.state.markers.map(this.toMarker, this)}
          </GoogleMap>
        );
      }
}

export default GoogleMapView;
