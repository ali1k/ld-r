import React from 'react';
import GoogleMapView from '../common/GoogleMapView';
/**
display geo coordinates (POINT) on Google Map
*/
class BasicMapView extends React.Component {
    render() {
        let val, outputDIV, coordinates;
        val = this.props.spec.value;
        let zoomLevel = 14;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        if(this.props.zoomLevel){
            zoomLevel = this.props.zoomLevel;
        }
        if(this.props.spec.valueType === 'typed-literal' && this.props.spec.dataType==='http://www.openlinksw.com/schemas/virtrdf#Geometry'){
            val = val.replace('POINT(', '').replace(')', '');
            coordinates = val.split(' ');
            outputDIV = <GoogleMapView key={this.props.spec.value} markers={[{position: {lat: parseFloat(coordinates[1]), lng: parseFloat(coordinates[0])}, key: this.props.spec.value}]} zoomLevel={zoomLevel} center={{lat: parseFloat(coordinates[1]), lng: parseFloat(coordinates[0])}}/>;
        }else{
            outputDIV = <span> {val} </span>;
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
