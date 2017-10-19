import React from 'react';
import ReactDOM from 'react-dom';
import passwordHash from 'password-hash';
/**
A component to edit password/hidden values
*/
class PasswordInput extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        this.state = {value: ''};
    }
    componentDidMount() {
        if(!this.props.noFocus){
            ReactDOM.findDOMNode(this.refs.passwordInput).focus();
        }
    }
    componentWillMount() {
        //to initialize value in Property state
        this.props.onDataEdit(this.state.value);
    }
    handleKeyDown(evt) {
        if(this.props.allowActionByKey){
            switch (evt.keyCode) {
                //case 9: // Tab
                case 13: // Enter
                    this.props.onEnterPress();
                    break;
            }
        }
    }
    handleChange(event) {
        this.props.onDataEdit(passwordHash.generate(event.target.value.trim()));
        this.setState({value: event.target.value});
    }
    render() {
        return (
            <div className="ui">
                <input ref="passwordInput" type="password" value={this.state.value} placeholder={(this.props.placeholder ? this.props.placeholder : '' )} onChange={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)}/>
            </div>
        );
    }
}

export default PasswordInput;
