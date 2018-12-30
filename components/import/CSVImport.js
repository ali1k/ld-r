import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {provideContext} from 'fluxible-addons-react';
import FileInput from '../../components/object/editor/individual/FileInput';
import parseCSV from '../../actions/parseCSV';
import {enableCSVImport} from '../../configs/general';
import createSampleCSVMapping from '../../actions/createSampleCSVMapping';
import CSVPreview from './CSVPreview';
import { Button, Divider, Form } from 'semantic-ui-react';
import {connectToStores} from 'fluxible-addons-react';
import ImportStore from '../../stores/ImportStore';

class CSVImport extends React.Component {
    constructor() {
        super();
        this.state = {status: 0, delimiter: ',', filePath: ''};
    }
    handleDelimiterChange(event) {
        this.setState({delimiter: event.target.value});
    }
    handleMappingCreation() {
        //create a sample mapping configuration editable by user
        let self = this;
        let sample = self.props.ImportStore.rows[0];
        let columns = [];
        for(let prop in sample){
            columns.push(prop);
        }
        this.context.executeAction(createSampleCSVMapping, {
            filePath: self.state.filePath,
            delimiter: self.state.delimiter,
            columns: columns
        });
    }
    handleDataEdit(value){
        let self = this;
        //after the file is uploaded should start the processing
        //console.log(value);
        //call parsing action
        let fileBase= window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
        self.setState({status: 1, filePath: value});
        this.context.executeAction(parseCSV, {
            fileName: value.replace(fileBase, ''),
            delimiter: self.state.delimiter
        });
    }
    render() {
        if(!enableCSVImport){
            return (
                <div className="ui fluid container ldr-padding" ref="CSVImport">
                    <div className="ui grid">
                        <div className="ui row">
                            <div className="column">
                                <div className="ui segment content">
                                    <h2>It is not allowed to import CSV files based on your current configurations. Please contact your admin to enable this feature...</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        let dropzoneRef;
        return (
            <div className="ui fluid container ldr-padding" ref="CSVImport">
                <div className="ui grid">
                    <div className="ui row">
                        <div className="column">
                            <div className="ui segment content">
                                <h2 className="ui header">Import CSV files (as JSON-LD RDF Graph)</h2>
                                <section>
                                    <Form size='big'>
                                        {!this.state.status ? <Form.Field label='Delimiter*' control='input' placeholder='Delimiter e.g. , or ;' onChange={this.handleDelimiterChange.bind(this)} value={this.state.delimiter} style={{width: '100px'}}/> :null}
                                        <Divider hidden />
                                        {!this.state.status ?
                                            <FileInput onDataEdit={this.handleDataEdit.bind(this)} config={{acceptedMimeTypes: 'text/*, text/csv, application/csv, application/vnd.ms-excel', maxFileSize: 157286400, fileNamePrefix: 'data'}}/>
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
                                        <Divider hidden />
                                        {
                                            this.props.ImportStore.completed &&  this.props.ImportStore.total ?
                                                <center><a className="ui icon button" href="/importCSV"><i className="left arrow icon"></i> Reset</a> <div className="ui primary icon button" onClick={this.handleMappingCreation.bind(this)}>Configuration <i className="right arrow icon"></i></div></center>
                                                : null
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
