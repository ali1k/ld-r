import React from 'react';

class BasicIndividualView extends React.Component {
    render() {
        let outputDIV;
        if(this.props.spec.valueType === 'uri'){
            outputDIV = <a href={this.props.spec.value} target="_blank"> {this.props.spec.value} </a>;
        }else{
            outputDIV = <span> {this.props.spec.value} </span>;
        }
        return (
            <div className="ui">
                {outputDIV}
            </div>
        );
    }
}

export default BasicIndividualView;
