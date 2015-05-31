import React from 'react';

class BasicCheckbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {checked: false};
        //initial data sent
        if(!this.props.notInitialize){
            this.props.onToggle(false);
        }
    }
    handleClick(event) {
        this.props.onToggle(!this.state.checked);
        this.setState({checked: !this.state.checked});
    }
    handleChange(event) {

    }
    render() {
        return (
            <div className="ui basic icon button" ref="basicCheckbox" onClick={this.handleClick.bind(this)}>
                <input type="checkbox" ref="checkBox" onChange={this.handleChange.bind(this)} checked={this.state.checked}/>
            </div>
        );
    }
}

export default BasicCheckbox;
