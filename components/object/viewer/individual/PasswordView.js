import React from 'react';

class PasswordView extends React.Component {
    render() {
        let outputDIV;
        outputDIV = <span> *********************************** </span>;
        return (
            <div className="ui" ref="passwordView">
                {outputDIV}
            </div>
        );
    }
}

export default PasswordView;
