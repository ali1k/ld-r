import React from 'react';

class BasicTextareaInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.spec.value};
    }
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    render() {
        return (
            <div className="ui">
                <textarea value={this.state.value} onChange={this.handleChange.bind(this)}></textarea>
            </div>
        );
    }
}

export default BasicTextareaInput;
