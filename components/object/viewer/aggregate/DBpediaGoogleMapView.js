import React from 'react';
import {connectToStores} from 'fluxible-addons-react';
import GoogleMapView from './GoogleMapView';
import BasicAggregateView from './BasicAggregateView';
import DBpediaGMapStore from '../../../../stores/DBpediaGMapStore';
import getCoordinates from '../../../../actions/getCoordinates';

class DBpediaGoogleMapView extends React.Component {
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
            <div ref="DBpediaGoogleMapView">
                    {this.props.DBpediaGMapStore.coordinates.length? <GoogleMapView key={this.props.DBpediaGMapStore.coordinates.length} markers={this.props.DBpediaGMapStore.coordinates} zoomLevel={3} center={{lat: 48.2000, lng: 16.3500}}/> :''}
                   <BasicAggregateView spec={this.props.spec} config={this.props.config} />
            </div>
    	);
    }


}
DBpediaGoogleMapView.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
DBpediaGoogleMapView = connectToStores(DBpediaGoogleMapView, [DBpediaGMapStore], function (context, props) {
    return {
        DBpediaGMapStore: context.getStore(DBpediaGMapStore).getState()
    };
});
export default DBpediaGoogleMapView;
