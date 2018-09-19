import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import request from 'superagent';

/*----config
    accepted mime-types
    maximum File size in bytes
    file name prefix
------------*/
/**
A file upload box to allow uploading files
*/
class FileInput extends React.Component {
    constructor() {
        super();
        this.state = {status: 0, progress: 0}; //status 0: start, 1: uploading, 2: uploaded
    }
    getRandomNumber() {
        return Math.round(+new Date() / 1000);
    }
    getFormatFromName(name) {
        let tmp = name.split('.');
        return tmp[tmp.length - 1];
    }
    onDrop(files) {
        let filePrefixName = this.props.config && this.props.config.fileNamePrefix ? this.props.config.fileNamePrefix : 'file';
        let req, fname;
        files.forEach((file)=> {
            fname = filePrefixName + this.getRandomNumber() + '.' + this.getFormatFromName(file.name);
            req = request.post('/upload/' +encodeURIComponent(fname));
            req.attach(fname, file);
        });

        req.on('progress', function(e) {
            console.log('Percentage done: ', e.percent);
            this.setState({status: 1, progress: e.percent});
        }).end((err,res)=> {
            //console.log(err,res);
            this.props.onDataEdit(window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '') + '/uploaded/'+ fname);
        });

    }

    render() {
        let dropzoneRef;
        let acceptedMimeTypes = this.props.config && this.props.config.acceptedMimeTypes ? this.props.config.acceptedMimeTypes : '';
        let maxFileSize = this.props.config && this.props.config.maxFileSize ? Number(this.props.config.maxFileSize) : 157286400; //150MB default
        return (
            <div className="ui fluid container ldr-padding" ref="fileInput">
                <div className="dropzone">
                    <Dropzone style={{'width': '100%', 'height': '200px', borderWidth: '2px', borderStyle: 'dashed', borderRadius: '5px'}} ref={(node) => { dropzoneRef = node; }} accept={acceptedMimeTypes} maxSize={maxFileSize} multiple={false} onDrop={this.onDrop.bind(this)}>
                        <p>Drop your file here</p>
                    </Dropzone> or
                    &nbsp;<button className="ui button" type="button" onClick={() => { dropzoneRef.open() }}>
                    Browse and select a file
                    </button>
                </div>
            </div>
        );
    }
}

export default FileInput;
