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

        return (
            <div className="ui" ref="geoListBrowser">
                {this.props.instances.length > 100 ? 'Error: Maximum 100 geo items can be shown!' :
                    <BasicAggregateMapView spec={{instances: this.props.instances}} config={this.props.config}/>
                }
            </div>
        );
    }
}

export default GeoListBrowser;
