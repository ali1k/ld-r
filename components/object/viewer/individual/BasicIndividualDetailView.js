import React from 'react';
import PropertyHeader from '../../../property/PropertyHeader';
import ObjectIViewer from '../../ObjectIViewer';

class BasicIndividualDetailView extends React.Component {
    componentDidMount() {
        let currentComp = this.refs.detailProperties;
    }
    render() {
        let self = this;
        let list = this.props.spec.extendedViewData.map(function(node, index) {
            let llist = node.spec.instances.map(function(instance, index2){
                return (
                    <ObjectIViewer key={index + '_' + index2} spec={instance} config={node.config} graphName={self.props.graphName} resource={self.props.spec.value} property={node.spec.propertyURI}/>
                );
            });
            return (
                <div className="item" key={index}>
                    <div className="ui">
                        <div className="ui horizontal list">
                            <div className="item">
                                <PropertyHeader spec={node.spec} config={node.config} size="4" />
                            </div>
                        </div>
                        <div className="ui dividing header"></div>
                        <div className="fourteen wide column field list">
                                {llist}
                        </div>
                        <div className="one wide column field">

                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div ref="detailProperties" itemScope itemType={this.props.spec.objectType} itemID={this.props.spec.value}>
                <div className="ui attached primary segment">
                    <div className="ui list">
                        {list}
                    </div>
                </div>
            </div>
        );
    }
}

export default BasicIndividualDetailView;
