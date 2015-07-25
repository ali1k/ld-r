import React from 'react/addons';
import {GoogleMaps, Marker} from "react-google-maps";
const {update} = React.addons;
class GoogleMapView extends React.Component {
      constructor (...args) {
        super(...args);
        this.state = {
          markers: this.props.markers
        };
      }
      render () {
        const {props, state} = this,
              {googleMapsApi} = props;
        return (
          <GoogleMaps containerProps={{
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
            center={this.props.center}>
            {state.markers.map(toMarker, this)}
          </GoogleMaps>
        );

        function toMarker (marker, index) {
          return (
            <Marker
              position={marker.position}
              key={marker.key} />
          );
        }
      }
}

export default GoogleMapView;
