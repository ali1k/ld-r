import React from 'react';

class BasicIndividualInput extends React.Component {
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
                <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />
            </div>
        );
    }
}

export default BasicIndividualInput;
