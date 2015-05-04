import React from 'react';
import BasicIndividualView from './BasicIndividualView';

class BasicIndividualDetailView extends React.Component {
    render() {
        let outputDIV;
        if(this.props.spec.valueType === 'uri'){
            outputDIV = <a href={this.props.spec.value} target="_blank"> {this.props.spec.value} </a>;
        }else{
            outputDIV = <span> {this.props.spec.value} </span>;
        }
        let list = this.props.spec.extendedViewData.map(function(node, index) {
            return (
                <div className="item" key={index}>
                    <div className="ui form grid">
                        <div className="ui horizontal list">
                            <div className="item">
                                <h4>
                                    <a href={node.propertyURI} target="_blank"> {node.property} </a>
                                </h4>
                            </div>
                            <i className="item circle info icon link"></i>
                        </div>
                        <div className="ui dividing header"></div>
                        <div className="fourteen wide column field list">
                            <div className="ui attached secondary segment">
                                <BasicIndividualView spec={node}/>
                            </div>
                        </div>
                        <div className="one wide column field">

                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <div className="ui attached secondary segment">
                    {outputDIV}
                </div>
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
