import React from 'react';
import ReactDOM from 'react-dom';
/**
A simple toggle/checkbox component
*/
class ToggleEdit extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
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
    componentWillMount() {
        //to initialize value in Property state
        this.props.onDataEdit(this.state.value);
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
                {String(this.state.value) !== String(this['onValue']) ? this.state.value : ''}
                <div className="ui fitted toggle checkbox" title={val}>
                    <input type="checkbox" value={this.state.value} onChange={this.handleChange.bind(this)} checked ={String(this.state.value) === String(this['onValue'])}/>
                    <label>{this.state.value}</label>
                </div>
                {String(this.state.value) === String(this['onValue']) ? this.state.value : ''}
            </div>
        );
    }
}

export default ToggleEdit;
