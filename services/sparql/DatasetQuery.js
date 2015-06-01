'use strict';
import validUrl from 'valid-url';

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
            SELECT DISTINCT ?resource WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            } LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?resource ?graphName WHERE { \
                { GRAPH ?graphName \
                    { '+ st +' \
                    }\
                } \
            } LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }
        return this.prefixes + this.query;
    }
    getMasterPropertyValues(graphName, propertyURI) {
        let st = '?s <'+ propertyURI + '>  ?v.';
        /*jshint multistr: true */
        this.query = '\
        SELECT DISTINCT (count(?s) AS ?total) ?v WHERE {\
            { GRAPH <' + graphName + '> \
                { '+ st +' \
                } \
            } \
        } \
        ';
        return this.prefixes + this.query;
    }
    getMultipleFilters(prevSelection) {
        let st = '', filters, tmp, i = 0, hasInvalidURI = 0, hasValidURI = 0;
        filters = [];
        for (let key in prevSelection) {
            hasInvalidURI = 0;
            hasValidURI = 0;
            tmp = [];
            i++;
            if(prevSelection[key].length){
                prevSelection[key].forEach(function(el){
                    // automatically detect uris even in literal values
                    if(validUrl.is_web_uri(el)){
                        tmp.push('<' + el + '>');
                        hasValidURI = 1;
                    }else{
                        hasInvalidURI = 1 ;
                        tmp.push('"' + el + '"');
                    }
                })
                //special case: values are heterogenious, we should convert all to string and use str function then
                if(hasInvalidURI && hasValidURI) {
                    tmp = [];
                    prevSelection[key].forEach(function(el){
                        tmp.push('"' + el + '"');
                    });
                    filters.push('str(?v' + i + ') IN ('+ tmp.join(',') +')');
                }else{
                    if(hasInvalidURI){
                        filters.push('str(?v' + i + ') IN ('+ tmp.join(',') +')');
                    }else{
                        filters.push('?v' + i + ' IN ('+ tmp.join(',') +')');
                    }
                }
                //---------
                st = st + '?s <'+ key + '>  ?v' + i + '. ';
            }
        }
        st = st + ' FILTER (' + filters.join(' && ') + ') ';
        if(!filters.length){
            //no constrain is selected
            st = '?s a ?o .';
        }
        return st;
    }
    getSideEffects(graphName, propertyURI, prevSelection) {
        let st = this.getMultipleFilters(prevSelection);
        st = st + '?s <'+ propertyURI + '>  ?v.';
        /*jshint multistr: true */
        this.query = '\
        SELECT DISTINCT (count(?s) AS ?total) ?v WHERE {\
            { GRAPH <' + graphName + '> \
                { '+ st +' \
                } \
            } \
        } \
        ';
        return this.prefixes + this.query;
    }
    countSecondLevelPropertyValues(graphName, propertyURI, prevSelection) {
        let st = this.getMultipleFilters(prevSelection);
        /*jshint multistr: true */
        this.query = '\
        SELECT DISTINCT (count(?s) AS ?total) WHERE {\
            { GRAPH <' + graphName + '> \
                { '+ st +' \
                } \
            } \
        }\
        ';
        return this.prefixes + this.query;
    }
    getSecondLevelPropertyValues(graphName, propertyURI, prevSelection, offset) {
        let st = this.getMultipleFilters(prevSelection);
        /*jshint multistr: true */
        this.query = '\
        SELECT DISTINCT ?s WHERE {\
            { GRAPH <' + graphName + '> \
                { '+ st +' \
                } \
            } \
        } LIMIT 50 OFFSET ' + (offset-1);
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
