import React from 'react';
import BasicCheckbox from '../editor/individual/BasicCheckbox';
import ObjectIViewer from '../ObjectIViewer';
import URIUtil from '../../utils/URIUtil';
class CheckboxItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isActive: false};
    }
    checkBox(status) {
        this.props.onCheck(status, this.props.spec.value);
        this.setState({isActive: status});
    }
    addCommas(n){
        let rx = /(\d+)(\d{3})/;
        return String(n).replace(/^\d+/, function(w){
            while(rx.test(w)){
                w = w.replace(rx, '$1,$2');
            }
            return w;
        });
    }
    render() {
        let title, c;
        let graphName = this.props.graphName;
        if(this.props.config && this.props.config.objectIViewer){
            c = this.props.config;
            title = <ObjectIViewer graphName={this.props.graphName} spec={this.props.spec} config={c}/>;
        }else{
            title = this.props.spec.value;
            if(this.props.spec.label){
                title = this.props.spec.label;
            }else if(this.props.shortenURI && !(this.props.config && this.props.config.shortenURI === 0)){
                title = URIUtil.getURILabel(this.props.spec.value);
            }
            if(this.props.spec.valueType === 'uri'){
                if(this.props.config && this.props.config.hasLinkedValue){
                    if(this.props.config.linkedGraph){
                        graphName = this.props.config.linkedGraph[0];
                    }
                    title = <a className="ui label" href={'/dataset/' + encodeURIComponent(graphName) + '/resource/' + encodeURIComponent(this.props.spec.value)} target="_blank"> {title} </a>;
                }else{
                    title = <a href={this.props.spec.value} target="_blank"> {title} </a>;
                }
            }
        }
        if(this.state.isActive){
            title = <b> {title} </b>;
        }
        return (
            <div className="ui" ref="checkboxItem">
                <div className="ui horizontal list">
                    <div className="item">
                        <BasicCheckbox onToggle={this.checkBox.bind(this)} notInitialize={true} />
                    </div>
                    <div className="item">
                        {title}
                    </div>
                    <div className="item">
                        {this.props.total ? <span className="ui small blue circular label"> {this.addCommas(this.props.total)} </span> : ''}
                    </div>
                </div>
            </div>
        );
    }
}

export default CheckboxItem;
