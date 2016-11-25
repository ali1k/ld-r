import React from 'react';
import BasicAggregateMapView from '../viewer/aggregate/BasicAggregateMapView';

class GeoListBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selected: []};
    }
    selectItem(value) {
        let pos = this.state.selected.indexOf(value);
        if(pos === -1){
            this.props.onCheck(1, value);
            this.state.selected.push(value);
        }else{
            this.props.onCheck(0, value);
            this.state.selected.splice(pos, 1);
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
            instances[i].weight = (0.18+tmp)>=0.5 ? 0.5 : tmp;
            instances[i].hint = instance.total;
        })
        return (
            <div className="ui" ref="geoListBrowser">
                {this.props.instances.length > 207 ? 'Error: Maximum 207 geo items can be shown!' :
                    <BasicAggregateMapView spec={{instances: instances}} config={cnf}/>
                }
            </div>
        );
    }
}

export default GeoListBrowser;
