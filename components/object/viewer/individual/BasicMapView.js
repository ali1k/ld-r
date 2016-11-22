import React from 'react';
import LeafletMapView from '../common/LeafletMapView';
/**
display geo coordinates (POINT) on Google Map
*/
class BasicMapView extends React.Component {
    parseVirtPolygon(val) {

        let out = [];
        if (val.indexOf('POLYGON') !== -1) {
            let tmp = val.split(')');
            let tl = tmp.length;
            if(tl){
                let tmp3, tmp2 = tmp[0].split('(');
                if(tl === 3){
                    //normal polygon
                    //console.log(tmp);
                    tmp3 = tmp2[2].split(',');
                }else if (tl > 3){
                    //polygon with holes or multipolygons
                    //console.log(tmp);
                    //get the first part only
                    tmp3 = tmp2[3].split(',');
                }
                out = [tmp3];
            }
        }else if (val.indexOf('MULTIPOLYGON') !== -1) {
            let res = val.replace('MULTIPOLYGON(', '');
            res = res.substring(0, res.length - 1);
            // ((----)),((------)),((---------))
            let parts = res.split('((');
            let tmp;
            parts.forEach((el)=>{
                tmp = el.trim().replace(')),', '');
                tmp = tmp.replace('))', '');
                if(tmp){
                    out.push(tmp.split(','));
                }
            });
        }
        if(out.length){
            let multiPLG = [];
            let polgArr = [];
            out.forEach(function(plg){
                polgArr = [];
                plg.forEach(function(el){
                    if(typeof el == 'string'){
                        var tmp = el.split(' ');
                        polgArr.push([parseFloat(tmp[1]), parseFloat(tmp[0])]);
                    }
                });
                if(polgArr.length){
                    multiPLG.push(polgArr);
                }
            });
            let shapeType, coordinatesArr, features= [];
            if(multiPLG.length > 1){
                shapeType = 'MultiPolygon';
                coordinatesArr = multiPLG;

            }else{
                shapeType = 'Polygon';
                coordinatesArr = multiPLG[0];
            }

            let focusPoint;
            if(shapeType == 'Polygon'){
                focusPoint = coordinatesArr[0];
            }else{
                focusPoint = coordinatesArr[0][0];
            }
            return  {focusPoint: focusPoint, coordinates: coordinatesArr};
        }else{
            return 0;
        }
    }
    render() {
        let val, outputDIV, coordinates, long, lat;
        val = this.props.spec.value;
        let zoomLevel = 14;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        outputDIV = <span> {val} </span>;
        //identify the type of geo shape
        if (val.indexOf('POLYGON') !== -1 || val.indexOf('MULTIPOLYGON') !== -1) {
            let data = this.parseVirtPolygon(this.props.spec.value);
            if(data){
                zoomLevel = 8;
                if(this.props.zoomLevel){
                    zoomLevel = this.props.zoomLevel;
                }
                outputDIV = <LeafletMapView key={'shape'} polygons={[data.coordinates]} zoomLevel={zoomLevel} center={{lat: parseFloat(data.focusPoint[0]), lng: parseFloat(data.focusPoint[1])}} />;
            }
        }else{
            if(this.props.zoomLevel){
                zoomLevel = this.props.zoomLevel;
            }
            //default is a POINT
            val = val.replace('POINT(', '').replace(')', '');
            coordinates = val.split(' ');
            long = parseFloat(coordinates[0]);
            lat = parseFloat(coordinates[1]);
            if((this.props.config && this.props.config.swapLongLat) || this.props.swapLongLat){
                long = parseFloat(coordinates[1]);
                lat = parseFloat(coordinates[0]);
            }
            if(coordinates.length){
                outputDIV = <LeafletMapView key={this.props.spec.value} markers={[{position: {lat: lat, lng: long}, key: this.props.spec.value}]} zoomLevel={zoomLevel} center={{lat: lat, lng: long}}/>;
            }
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
    Swap longitude and latitudes: default is POINT(long lat)
    */
    swapLongLat: React.PropTypes.bool,
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
