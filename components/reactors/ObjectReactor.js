import React from 'react';
import {provideContext, connectToStores} from 'fluxible-addons-react';
import loadObjectProperties from '../../actions/loadObjectProperties';
import IndividualObjectStore from '../../stores/IndividualObjectStore';
import {navigateAction} from 'fluxible-router';
import IndividualObject from '../object/IndividualObject';
import AggregateObject from '../object/AggregateObject';

class ObjectReactor extends React.Component {
    constructor(props) {
        super(props);
    }
    handleShowDetails(objectURI) {
        this.context.executeAction(loadObjectProperties, {
          dataset: this.props.graphName,
          resourceURI: this.props.resource,
          propertyURI: this.props.property,
          objectURI: objectURI
        });
    }
    includesProperty(list, resource, property) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource && el.p === property){
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource, property) {
        if(this.props.enableAuthentication) {
            if(user){
                if(parseInt(user.isSuperUser)){
                    return {access: true, type: 'full'};
                }else{
                    if(graph && user.editorOfGraph.indexOf(graph) !== -1){
                        return {access: true, type: 'full'};
                    }else{
                        if(resource && user.editorOfResource.indexOf(resource) !== -1){
                            return {access: true, type: 'full'};
                        }else{
                            if(property && this.includesProperty(user.editorOfProperty, resource, property)){
                                return {access: true, type: 'partial'};
                            }else{
                                return {access: false};
                            }
                        }
                    }
                }
            }else{
                return {access: false};
            }
        }else{
            return {access: true, type: 'full'};
        }
    }
    //considers 0 elements
    calculateValueCount (instances){
        let count = 0;
        instances.forEach(function(v, i) {
            if(instances[i]){
                count++;
            }
        });
        return count;
    }
    //removes properties from an object
    configMinus(config, props) {
        let o = {};
        for(let p in config) {
            if(props.indexOf(p) === -1){
                o [p] = config [p];
            }
        }
        return o;
    }
    render() {
        let self = this;
        let list, user = this.context.getUser();
        if(this.props.isNewValue){
            list = <IndividualObject key="newValueInput" isNewValue={true} inEditMode={true} spec={self.props.spec} graphName={self.props.graphName} resource={self.props.resource} property={self.props.property}
            onCreate={self.props.onCreateIndividualObject.bind(self)} config={self.configMinus(self.props.config, ['objectReactor'])} />;
        }else{
            //check if it is the only value of a property -> used to hide delete button
            let isOnlyChild = (this.calculateValueCount(this.props.spec.instances) === 1);
            let objectReactorType, accessLevel, readOnly;
            if(this.props.config){
                if(!this.props.config.objectReactor){
                    objectReactorType = 'IndividualObject';
                }else{
                    objectReactorType = this.props.config.objectReactor[0];
                }
            }
            if(objectReactorType){
                switch(objectReactorType){
                    case 'IndividualObject':
                        list = this.props.spec.instances.map(function(node, index) {
                            if(!node){
                                return undefined; // stop processing this iteration
                            }
                            //check access level for details
                            readOnly = self.props.readOnly;
                            if(node.extended){
                                accessLevel = self.checkAccess(user, self.props.graphName, node.value, '');
                                if(!accessLevel.access){
                                    readOnly = true;
                                }
                            }
                            return (
                                <IndividualObject key={index} inEditMode={self.props.inEditMode} isNewValue={false} readOnly={readOnly} spec={node} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild}
                                onCreate={self.props.onCreateIndividualObject.bind(self)} onDelete={self.props.onDeleteIndividualObject.bind(self)} onUpdate={self.props.onUpdateIndividualObject.bind(self)} onDetailCreate={self.props.onDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.props.onDetailUpdateIndividualObject.bind(self)} onShowDetail={self.handleShowDetails.bind(self)} config={self.configMinus(self.props.config, ['objectReactor'])} objectTypes={self.props.ObjectReactor ? self.props.ObjectReactor.objectTypes : {}} objectProperties={self.props.ObjectReactor ? self.props.ObjectReactor.objectProperties : {}}/>
                            );
                        });
                    break;
                    case 'AggregateObject':
                        list = <AggregateObject inEditMode={self.props.inEditMode} readOnly={self.props.readOnly} isNewValue={false} spec={self.props.spec} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} onIndividualDelete={self.props.onDeleteIndividualObject.bind(self)} onIndividualUpdate={self.props.onUpdateIndividualObject.bind(self)} onDelete={self.props.onDeleteAggObject.bind(self)} onUpdate={self.props.onUpdateAggObject.bind(self)} onDetailCreate={self.props.onDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.props.onDetailUpdateIndividualObject.bind(self)} controlNewInsert={self.props.onControlNewInsert.bind(self)} config={self.configMinus(self.props.config, ['objectReactor'])}/>;
                    break;
                    default:
                        list = this.props.spec.instances.map(function(node, index) {
                            if(!node){
                                return undefined; // stop processing this iteration
                            }
                            //check access level for details
                            readOnly = self.props.readOnly;
                            if(node.extended){
                                accessLevel = self.checkAccess(user, self.props.graphName, self.props.resource, '');
                                if(!accessLevel.access){
                                    readOnly = true;
                                }
                            }
                            return (
                                <IndividualObject key={index} inEditMode={self.props.inEditMode} readOnly={readOnly} isNewValue={false} spec={node} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild}
                                onCreate={self.props.onCreateIndividualObject.bind(self)} onDelete={self.props.onDeleteIndividualObject.bind(self)} onUpdate={self.props.onUpdateIndividualObject.bind(self)} onDetailCreate={self.props.onDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.props.onDetailUpdateIndividualObject.bind(self)} onShowDetail={self.handleShowDetails.bind(self)} config={self.configMinus(self.props.config, ['objectReactor'])} objectTypes={self.props.ObjectReactor ? self.props.ObjectReactor.objectTypes : {}} objectProperties={self.props.ObjectReactor ? self.props.ObjectReactor.objectProperties : {}}/>
                            );
                        });
                }
            }
        }
        return (
            <div ref="objectReactor">
                {list}
            </div>
        );
    }
}
ObjectReactor.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
ObjectReactor = connectToStores(ObjectReactor, [IndividualObjectStore], function (context, props) {
    return {
        ObjectReactor: context.getStore(IndividualObjectStore).getState()
    };
});
export default ObjectReactor;
