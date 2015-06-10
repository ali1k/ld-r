import React from 'react';
import BasicCheckbox from './BasicCheckbox';
import IndividualDataView from './IndividualDataView';

class CheckboxItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isActive: false};
    }
    checkBox(status) {
        this.props.onCheck(status, this.props.spec.value);
        this.setState({isActive: status});
    }
    getURILabel(uri) {
        let property = '';
        let tmp = uri;
        let tmp2 = tmp.split('#');
        if(tmp2.length > 1){
            property = tmp2[1];
        }else{
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
        }
        return property;
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
        if(this.props.config && this.props.config.browserViewer){
            c = this.props.config;
            //we simulate viewer for individualDataView
            c.viewer = this.props.config.browserViewer;
            title = <IndividualDataView graphName={this.props.graphName} spec={this.props.spec} config={c}/>;
        }else{
            title = this.props.spec.value;
            if(this.props.spec.label){
                title = this.props.spec.label;
            }else if(this.props.shortenURI){
                title = this.getURILabel(this.props.spec.value);
            }
            if(this.props.spec.valueType === 'uri'){
                if(this.props.config && this.props.config.hasLinkedValue){
                    title = <a className="ui label" href={'/dataset/' + encodeURIComponent(this.props.graphName) + '/resource/' + encodeURIComponent(this.props.spec.value)} target="_blank"> {title} </a>;
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
