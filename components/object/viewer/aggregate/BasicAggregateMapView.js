import React from 'react';
import LeafletMapView from '../common/LeafletMapView';

class BasicAggregateMapView extends React.Component {
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
        let self = this;
        let val, outputDIV, coordinates, long, lat, data, coordinatesArr=[], polygonsArr=[], focusPoint;
        let zoomLevel = 8;
        if(this.props.config && this.props.config.zoomLevel){
            zoomLevel = this.props.config.zoomLevel;
        }
        this.props.spec.instances.forEach((node, index)=> {
            if(!node){
                return undefined; // stop processing this iteration
            }
            if (node.value.indexOf('POLYGON') !== -1 || node.value.indexOf('MULTIPOLYGON') !== -1) {
                data = self.parseVirtPolygon(node.value);
                if(data){
                    polygonsArr.push(data.coordinates);
                    zoomLevel = 8;
                    if(this.props.zoomLevel){
                        zoomLevel = this.props.zoomLevel;
                    }
                    if(!focusPoint){
                        focusPoint = {lat: parseFloat(data.focusPoint[0]), lng: parseFloat(data.focusPoint[1])};
                    }
                }
            }else{
                val = node.value.replace('POINT(', '').replace(')', '');
                coordinates = val.split(' ');
                long = parseFloat(coordinates[0]);
                lat = parseFloat(coordinates[1]);
                if((self.props.config && self.props.config.swapLongLat) || self.props.swapLongLat){
                    long = parseFloat(coordinates[1]);
                    lat = parseFloat(coordinates[0]);
                }
                coordinatesArr.push({position: {lat: lat, lng: long}, key: node.value});
            }

        });
        let center;
        if(coordinatesArr.length){
            center = {lat: coordinatesArr[0].position.lat, lng: coordinatesArr[0].position.lng};
        }else{
            //for polygons
            center = focusPoint;
            zoomLevel = 8;
            if(this.props.zoomLevel){
                zoomLevel = this.props.zoomLevel;
            }
        }
        return (
            <div className="ui" ref="basicAggregateMapView">
                <LeafletMapView key="bamv" markers={coordinatesArr} polygons={polygonsArr} zoomLevel={zoomLevel} center={center}/>
            </div>
        );
    }
}

export default BasicAggregateMapView;
