import React from 'react';
import moment from 'moment';

/*----config
    dateTimeFormat
------------*/
class BasicDateTimeView extends React.Component {
    getFormat() {
        //default format
        let format = 'YYYY-MM-DD HH:mm:ss Z';
        if(this.props.config && this.props.config.dateTimeFormat){
            format = this.props.config.dateTimeFormat;
        }
        return format;
    }
    render() {
        let val;
        val = this.props.spec.value;
        val = moment(val).format(this.getFormat());
        return (
            <div className="ui" ref="basicDateTimeView">
                {val}
            </div>
        );
    }
}

export default BasicDateTimeView;
