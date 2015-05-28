'use strict';
class DatasetQuery{
    constructor() {
        /*jshint multistr: true */
        this.prefixes='\
        PREFIX dcterms: <http://purl.org/dc/terms/> \
        PREFIX void: <http://rdfs.org/ns/void#> \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
         ';
        this.query='';
    }
    countResourcesByType(graphName, type) {
        let st = '?resource a <'+ type + '> .';
        //will get all the types
        if(!type.length || (type.length && !type[0]) ){
            st = '?resource a ?type .';
        }
        //if we have multiple type, get all of them
        let typeURIs = [];
        if(type.length > 1){
            type.forEach(function(uri) {
                typeURIs.push('<' + uri + '>');
            });
            st = '?resource a ?type . FILTER (?type IN (' + typeURIs.join(',') + '))';
        }
        //go to default graph if no graph name is given
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT count(?resource) AS ?total WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            }  \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT count(?resource) AS ?total WHERE { \
                { GRAPH ?graphName \
                    { '+ st +' \
                    }\
                } \
            }  \
            ';
        }
        return this.prefixes + this.query;
    }
    getResourcesByType(graphName, type, limit, offset) {
        let st = '?resource a <'+ type + '> .';
        //will get all the types
        if(!type.length || (type.length && !type[0]) ){
            st = '?resource a ?type .';
        }
        //if we have multiple type, get all of them
        let typeURIs = [];
        if(type.length > 1){
            type.forEach(function(uri) {
                typeURIs.push('<' + uri + '>');
            });
            st = '?resource a ?type . FILTER (?type IN (' + typeURIs.join(',') + '))';
        }
        //go to default graph if no graph name is given
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?resource ?label ?title WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    OPTIONAL {?resource dcterms:title ?title .} \
                    OPTIONAL {?resource rdfs:label ?label .} \
                    } \
                } \
            } LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?resource ?label ?title ?graphName WHERE { \
                { GRAPH ?graphName \
                    { '+ st +' \
                    OPTIONAL {?resource dcterms:title ?title .} \
                    OPTIONAL {?resource rdfs:label ?label .} \
                    }\
                } \
            } LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
