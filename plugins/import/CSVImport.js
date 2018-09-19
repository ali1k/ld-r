import React from 'react';
import ReactDOM from 'react-dom';
import FileInput from '../../components/object/editor/individual/FileInput';

class CSVImport extends React.Component {
    constructor() {
        super();
    }
    render() {
        let dropzoneRef;
        return (
            <div className="ui fluid container ldr-padding" ref="CSVImport">
                <div className="ui grid">
                    <div className="ui row">
                        <div className="column">
                            <div className="ui segment content">
                                <h2 className="ui header">Import CSV files</h2>
                                <section>
                                    <FileInput config={{acceptedMimeTypes: 'text/*'}}/>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = CSVImport;
