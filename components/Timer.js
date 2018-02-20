import React from 'react';

class Timer extends React.Component {
    constructor(props){
        super(props);
        this.state = {counter: 0, timer: null};
    }
    componentDidMount() {
        let self = this;
        let timer = setInterval(()=>{
            self.tick();
        }, 1000);
        this.setState({timer});
    }
    componentWillUnmount() {
        clearInterval(this.state.timer);
    }
    tick(){
        this.setState({
            counter: this.state.counter + 1
        });
    }
    render() {
        let msg = 'Wait a moment until the new environment is generated...';
        if(this.props.msg){
            msg = this.props.msg;
        }
        return (
            <div className="ui mini statistic">
                <div className="value">
                    {this.state.counter}
                </div>
                <div className="label">
                  Loading{'...'.substr(0, this.state.counter % 3 + 1)}
                </div>
            </div>
        );
    }
}

export default Timer;
