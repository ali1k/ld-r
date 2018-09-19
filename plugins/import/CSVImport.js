import React from 'react';
import ReactDOM from 'react-dom';
import FileInput from '../../components/object/editor/individual/FileInput';
import { Button, Divider, Form } from 'semantic-ui-react';

class CSVImport extends React.Component {
    constructor() {
        super();
        this.state = {status: 0, delimiter: ','};
    }
    handleDelimiterChange(event) {
        this.setState({delimiter: event.target.value});
    }
    handleDataEdit(value){
        let self = this;
        //after the file is uploaded should start the processing
        console.log(value);
        self.setState({status: 1});
        //call parsing action
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
                                    <Form size='big'>
                                        <Form.Field label='Delimiter' control='input' placeholder='Delimiter e.g. , or ;' onChange={this.handleDelimiterChange.bind(this)} value={this.state.delimiter} style={{width: '100px'}}/>
                                        <Divider hidden />
                                        {!this.state.status ?
                                            <FileInput onDataEdit={this.handleDataEdit.bind(this)} config={{acceptedMimeTypes: 'text/*', maxFileSize: 157286400, fileNamePrefix: 'data'}}/>
                                            :null
                                        }
                                        {this.state.status === 1 ?
                                            <div className="uploaded">
                                                Processing the file...
                                            </div>
                                            :null
                                        }
                                    </Form>
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
