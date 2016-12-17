'use strict';
let generalConfig = require('../../configs/general');
let appShortTitle = generalConfig.appShortTitle;
let appFullTitle = generalConfig.appFullTitle;
let object_viewer_individual = require('../../documentation/object_viewer_individual');

let getName = function(uri){
    let tmp = uri.split('/');
    let tmp2 = tmp [tmp.length-1];
    tmp2 = tmp2.replace('.js', '');
    return tmp2;
}
let objToArr = function(obj){
    let tmp, out=[];
    for(let prop in obj){
        tmp = obj[prop];
        tmp.id = prop;
        if(tmp.props){
            tmp.name = getName(tmp.id);
            tmp.uri = 'https://github.com/ali1k/ld-r/blob/master/' + tmp.id;
            tmp.properties = objToArr(tmp.props);
            delete tmp.props;
        }
        out.push(tmp);
    }
    return out;
}
module.exports = function handleDocumentation(server) {
    server.get('/documentation/:subject?', function(req, res) {
        let errorMsg, title= '', items = [];
        let subject = req.params.subject;
        if(subject){
            if(subject === 'object_viewer_individual'){
                items = objToArr(object_viewer_individual);
                title = 'Object->Viewer->Individual';
            }
        }else{
            errorMsg = 'Please specify the type of components.';
        }
        res.render('documentation', {appShortTitle: appShortTitle, appFullTitle: appFullTitle, items: items, errorMsg: errorMsg, title: title });
    });
};
