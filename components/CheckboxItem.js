import React from 'react';
import BasicCheckbox from './BasicCheckbox';

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
        let title = this.props.spec.value;
        if(this.props.spec.label){
            title = this.props.spec.label;
        }else if(this.props.shortenURI){
            title = this.getURILabel(this.props.spec.value);
        }
        return (
            <div className="inline field" ref="checkboxItem">
                <BasicCheckbox onToggle={this.checkBox.bind(this)} notInitialize={true} /> {(this.state.isActive ? <b> {title}</b> : title)} {this.props.total ? <span className="ui small blue circular label"> {this.addCommas(this.props.total)} </span> : ''}
            </div>
        );
    }
}

export default CheckboxItem;
