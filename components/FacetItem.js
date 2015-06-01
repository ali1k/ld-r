import React from 'react';
import BasicCheckbox from './BasicCheckbox';

class FacetItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isActive: false};
    }
    checkBox(status) {
        this.props.onCheck(status, this.props.value);
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
        return (
            <div className="inline field" ref="facetItem">
                <BasicCheckbox onToggle={this.checkBox.bind(this)} notInitialize={true} /> {(this.state.isActive ? <b> {this.props.label}</b> : this.props.label)} {this.props.total ? <span className="ui small blue circular label"> {this.addCommas(this.props.total)} </span> : ''}
            </div>
        );
    }
}

export default FacetItem;
