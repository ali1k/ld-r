import React from 'react';

class BasicCheckbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {checked: false};
        //initial data sent
        this.props.onToggle(false);
    }
    handleChange(event) {
        let c = this.refs.checkBox.getDOMNode();
        c.checked = !c.checked;
        this.setState({checked: c.checked});
        this.props.onToggle(c.checked);
    }
    render() {
        return (
            <div className="ui basic icon button" onClick={this.handleChange.bind(this)} ref="basicCheckbox">
                <input type="checkbox" ref="checkBox" onClick={this.handleChange.bind(this)}/>
            </div>
        );
    }
}

export default BasicCheckbox;
