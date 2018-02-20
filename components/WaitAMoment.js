import React from 'react';
import Timer from './Timer';

class WaitAMoment extends React.Component {

    render() {
        let msg = 'Wait a moment until the new environment is generated...';
        if(this.props.msg){
            msg = this.props.msg;
        }
        return (
            <div className="ui segment">
                <div className="ui right corner mini label">
                    <Timer />
                </div>
                <h2> <img src="/assets/img/loader.gif" alt="loading..." style={{height: 30, width: 30}} /> {msg}</h2>
            </div>
        );
    }
}

export default WaitAMoment;
