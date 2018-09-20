import React from 'react';
import ReactDOM from 'react-dom';

class CSVPreview extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="ui" ref="CSVPreview">
                {!this.props.spec.total ? 'No records was found in your file!'
                    :
                    ''
                }
            </div>
        );
    }
}

module.exports = CSVPreview;
