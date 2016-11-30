import React from 'react';
import {connectToStores} from 'fluxible-addons-react';
import LeafletMapView from '../common/LeafletMapView';
import BasicAggregateView from './BasicAggregateView';
import DBpediaGMapStore from '../../../../stores/DBpediaGMapStore';
import getCoordinates from '../../../../actions/getCoordinates';

class DBpediaMapView extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        //initialize map
        this.context.executeAction(getCoordinates, {uris: this.prepareURIs(this.props.spec.instances)});
    }
    prepareURIs(instances) {
        let uris = [];
        instances.forEach(function(node) {
            if(node.value.search('dbpedia.org') !== -1){
                uris.push(node.value);
            }
        });
        return uris;
    }
    componentDidUpdate(prevProps) {
        let newProps = this.props;
        let uris = this.prepareURIs(newProps.spec.instances);
        if (prevProps.spec.instances.length !== newProps.spec.instances.length) {
            this.context.executeAction(getCoordinates, {uris: uris});
        }
    }
    render () {
        return (
            <div ref="DBpediaMapView">
                    {this.props.DBpediaGMapStore.coordinates.length? <LeafletMapView key={this.props.DBpediaGMapStore.coordinates.length} markers={this.props.DBpediaGMapStore.coordinates} zoomLevel={3} center={{lat: 48.2000, lng: 16.3500}}/> :''}
                   <BasicAggregateView spec={this.props.spec} config={this.props.config} />
            </div>
    	);
    }


}
DBpediaMapView.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
DBpediaMapView = connectToStores(DBpediaMapView, [DBpediaGMapStore], function (context, props) {
    return {
        DBpediaGMapStore: context.getStore(DBpediaGMapStore).getState()
    };
});
export default DBpediaMapView;
