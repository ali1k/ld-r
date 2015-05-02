'use strict';
import {dbpediaLookupService} from '../configs/general';
import rp from 'request-promise';
import utils from './utils/dbpedia_utils';
let query;
export default {
    // Name is the resource. Required.
    name: 'dbpedia',
    // At least one of the CRUD methods is Required
    read: (req, resource, params, config, callback) => {
        if (resource === 'dbpedia.lookup') {
            query = params.query;
            //send request
            rp({method: 'get', headers: {'Accept': 'application/json'}, accept: 'application/json', uri: 'http://'+dbpediaLookupService[0].host+'/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=5&QueryString='+ query}).then(function(res){
                callback(null, {
                    suggestions: utils.parseDBpediaLookup(res)
                });
            }).catch(function (err) {
                console.log('\n Status Code: \n'+err.statusCode+'\n Error Msg: \n'+err.message);
                callback(null, {suggestions: []});
            });
        /////////////////////////////////////////////
        } else if (resource === 'dbpedia.annotate') {
            console.log('ToDo!');
          /////////////////////////////////////////////
        }
    }
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
};
