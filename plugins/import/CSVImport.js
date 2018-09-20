import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {provideContext} from 'fluxible-addons-react';
import FileInput from '../../components/object/editor/individual/FileInput';
import parseCSV from '../../actions/parseCSV';
import CSVPreview from './CSVPreview';
import { Button, Divider, Form } from 'semantic-ui-react';
import {connectToStores} from 'fluxible-addons-react';
import ImportStore from '../../stores/ImportStore';

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
        //console.log(value);
        self.setState({status: 1});
        //call parsing action
        let fileBase= window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
        this.context.executeAction(parseCSV, {
            fileName: value.replace(fileBase, ''),
            delimiter: self.state.delimiter
        });
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
                                        {!this.state.status ? <Form.Field label='Delimiter' control='input' placeholder='Delimiter e.g. , or ;' onChange={this.handleDelimiterChange.bind(this)} value={this.state.delimiter} style={{width: '100px'}}/> :null}
                                        <Divider hidden />
                                        {!this.state.status ?
                                            <FileInput onDataEdit={this.handleDataEdit.bind(this)} config={{acceptedMimeTypes: 'text/*', maxFileSize: 157286400, fileNamePrefix: 'data'}}/>
                                            :null
                                        }
                                        {this.state.status === 1 ?
                                            <div className="uploaded">
                                                {this.props.ImportStore.completed ?
                                                    <CSVPreview spec={this.props.ImportStore}/>
                                                    : 'Processing the file...'}
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
CSVImport.contextTypes = {
    executeAction: PropTypes.func.isRequired
};
CSVImport = connectToStores(CSVImport, [ImportStore], function (context, props) {
    return {
        ImportStore: context.getStore(ImportStore).getState()
    };
});
module.exports = CSVImport;
