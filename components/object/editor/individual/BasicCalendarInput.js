import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from 'rc-calendar';
import moment from 'moment';
if (process.env.BROWSER) {
    require('rc-calendar/assets/index.css');
}
/*----config
    calendarFormat
------------*/
class BasicCalendarInput extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        if(this.props.spec.isDefault){
            v = this.createDefaultValue();
        }
        this.state = {value: v};
    }
    componentDidMount() {
        if(!this.props.noFocus){
            ReactDOM.findDOMNode(this.refs.basicCalendarInput).focus();
        }
    }
    componentWillMount() {
        //to initialize value in Property state
        this.props.onDataEdit(this.state.value);
    }
    getFormat() {
        //default format
        let format = 'YYYY-MM-DD'; //YYYY-MM-DD\\THH:mm:ss\\Z
        if(this.props.config && this.props.config.calendarFormat){
            format = this.props.config.calendarFormat;
        }
        return format;
    }
    createDefaultValue() {
        return moment();
    }
    handleChange(event) {
        let v = moment(event).utc().format(this.getFormat());
        this.props.onDataEdit(v);
        this.setState({value: moment(event).utc()});
    }
    render() {
        return (
            <div className="ui" ref="basicCalendarInput">
                <Calendar value={moment(this.state.value).utc()} format={this.getFormat()} onChange={this.handleChange.bind(this)} />
            </div>
        );
    }
}

export default BasicCalendarInput;
