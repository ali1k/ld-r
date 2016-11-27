import React from 'react';
import BasicAggregateMapView from '../viewer/aggregate/BasicAggregateMapView';

class GeoListBrowser extends React.Component {
    constructor(props) {
        super(props);
    }
    doesExist(value){
        let selected=[];
        if(!this.props.propertyURI){
            for(let prop in this.props.selection){
                selected.push(prop);
            }
        }else{
            if(this.props.selection[this.props.propertyURI]){
                this.props.selection[this.props.propertyURI].forEach((node)=>{
                    selected.push(node.value);
                });
            }
        }
        let pos = selected.indexOf(value);
        if(pos === -1){
            return false;
        }else{
            return true;
        }
    }
    selectItem(value) {
        if(this.doesExist(value)){
            this.props.onCheck(0, value);
        }else{
            this.props.onCheck(1, value);
        }
    }
    render() {
        let self = this;
        let cnf = this.props.config;
        if(!cnf.mapHeight){
            cnf.mapHeight = 500;
        }
        if(!cnf.mapWidth){
            cnf.mapWidth = 500;
        }
        if(!cnf.zoomLevel){
            cnf.zoomLevel = 6;
        }
        let totalVals=0;
        let instances = this.props.instances;
        this.props.instances.forEach((instance)=>{
            totalVals = totalVals + parseInt(instance.total);
        })
        let tmp=0.2;
        this.props.instances.forEach((instance, i)=>{
            tmp = parseInt(instance.total)/totalVals;
            instances[i].weight = 0.05+tmp;
            instances[i].hint = instance.total;
        })
        let mapWidth = 180;
        let mapHeight = 180;
        if(this.props.expanded){
            mapWidth = 430;
            mapHeight = 400;
        }
        return (
            <div className="ui" ref="geoListBrowser">
                {this.props.instances.length > 777 ? 'Error: Maximum 777 geo items can be shown!' :
                    <BasicAggregateMapView  mapWidth={mapWidth} mapHeight={mapHeight} spec={{instances: instances}} config={cnf}/>
                }
            </div>
        );
    }
}

export default GeoListBrowser;
