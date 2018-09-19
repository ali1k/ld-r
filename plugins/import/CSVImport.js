import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import request from 'superagent';

class CSVImport extends React.Component {
    constructor() {
        super();
    }
    getRandomNumber() {
        return Math.round(+new Date() / 1000);
    }
    getFormatFromName(name) {
        let tmp = name.split('.');
        return tmp[tmp.length - 1];
    }
    onDrop(files) {
        let req, fname;
        files.forEach((file)=> {
            fname = 'file' + this.getRandomNumber() + '.' + this.getFormatFromName(file.name);
            req = request.post('/upload/' +encodeURIComponent(fname));
            req.attach(fname, file);
        });

        req.on('progress', function(e) {
            console.log('Percentage done: ', e.percent);
        }).end((err,res)=> {
            console.log(err,res);
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
                                    <div className="dropzone">
                                        <Dropzone  ref={(node) => { dropzoneRef = node; }} accept="text/*" multiple={false} onDrop={this.onDrop.bind(this)}>
                                            <p>Drop your CSV file here</p>
                                        </Dropzone> or
                                        <button type="button" onClick={() => { dropzoneRef.open() }}>
                                            Browse and select a CSV file
                                        </button>
                                    </div>
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
