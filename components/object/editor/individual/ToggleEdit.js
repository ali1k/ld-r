
import React from 'react';
import ReactDOM from 'react-dom';

class ToggleEdit extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        //to initialize value in Property state
        this.props.onDataEdit(v);
        let onValue = '1';
        let offValue = '0';
        if(this.props.config){
            if(this.props.config.onValue){
                onValue = this.props.config.onValue;
            }
            if(this.props.config.offValue){
                offValue = this.props.config.offValue;
            }
        }
        this['onValue']= onValue;
        this['offValue']= offValue;
        this.state = {value: v};
    }

    handleChange(event) {
        let newVal = String(event.target.value) === String(this['onValue']) ? String(this['offValue']) : String(this['onValue']);
        this.props.onDataEdit(newVal);
        this.setState({value: newVal});
    }
    render() {
        let val = this.props.spec.value;
        return (
            <div ref="toggleEdit">
                <div className="ui fitted toggle checkbox" title={val}>
                  <input type="checkbox" value={this.state.value} onChange={this.handleChange.bind(this)} checked ={String(this.state.value) === String(this['onValue'])}/>
                  <label>{this.state.value}</label>
                </div> {this.state.value}
            </div>
        );
    }
}

export default ToggleEdit;
