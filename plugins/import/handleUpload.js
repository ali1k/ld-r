'use strict';
const fileUpload = require('express-fileupload');
const http = require('http'),
    fs = require('fs'),
    path = require('path');
module.exports = function handleUpload(server) {
    server.use(fileUpload());
    server.post('/upload/:fname', function(req, res) {
        //console.log(req);
        if (!req.files)
            return res.status(400).send('No files were uploaded.');
        let fname = 'noName' + '_' + Date.now();
        if(req.params.fname){
            fname = decodeURIComponent(req.params.fname);
        }
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let sampleFile = req.files[fname];

        let saveTo = path.join('./uploaded/', fname);
        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(saveTo, function(err) {
            if (err)
                return res.status(500).send(err);

            res.send('File uploaded!');
        });
    });
};
