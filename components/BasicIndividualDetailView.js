import React from 'react';
import BasicIndividualView from './BasicIndividualView';

class BasicIndividualDetailView extends React.Component {
    componentDidMount() {
        let currentComp = this.refs.detailProperties.getDOMNode();
        //enable hints
        /*global $*/
        $(currentComp).find('.hint')
        .popup({
          hoverable: true
        });
    }
    render() {
        let outputDIV, hintDIV;
        if(this.props.spec.valueType === 'uri'){
            outputDIV = <a href={this.props.spec.value} target="_blank"> {this.props.spec.value} </a>;
        }else{
            outputDIV = <span> {this.props.spec.value} </span>;
        }
        let list = this.props.spec.extendedViewData.map(function(node, index) {
            hintDIV = '';
            if(node.config && node.config.hint){
                hintDIV = <a className="hint" data-content={node.config.hint[0]}> <i className="item circle info icon link"></i> </a>;
            }
            return (
                <div className="item" key={index}>
                    <div className="ui form grid">
                        <div className="ui horizontal list">
                            <div className="item">
                                <h4>
                                    <a href={node.spec.propertyURI} target="_blank"> {node.spec.property} </a>
                                    {hintDIV}
                                </h4>
                            </div>
                        </div>
                        <div className="ui dividing header"></div>
                        <div className="fourteen wide column field list">
                            <div className="ui attached secondary segment">
                                <BasicIndividualView spec={node.spec} config={node.config}/>
                            </div>
                        </div>
                        <div className="one wide column field">

                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div ref="detail_properties">
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
