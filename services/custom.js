'use strict';
import CustomUtil from './utils/CustomUtil';

let utilObject = new CustomUtil();
//flashtext config
import KeywordProcessor from 'flashtext.js';
const processor = new KeywordProcessor();
//the json file can be replaced by any arbitrary dictionary for NER
let flashtext_dict = require('../data/ner_dict.json');
processor.addKeywordsFromObject(flashtext_dict);

export default {
    // Name is the resource. Required.
    name: 'custom',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'custom.ner') {
            //uses flashtext to extract named entities
            let input = params.query;
            let stopWords = params.stopWords;
            if(!input){
                callback(null, {
                    tags: [],
                    id: params.id,
                    query: params.query
                });
                return 0;
            }
            let keywordsFound = processor.extractKeywords(
                input
            );
            callback(null, {
                tags: utilObject.parseFlashTextOutput(keywordsFound, stopWords),
                id: params.id,
                query: params.query
            });
        }else{

        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
