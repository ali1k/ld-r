'use strict';
import {getQueryDataTypeValue} from '../utils/helpers';
class DatasetQuery{
    constructor() {
        /*jshint multistr: true */
        this.prefixes='\
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
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
            SELECT ?resource count(?resource) AS ?total WHERE {\
                    { '+ st +' \
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
            SELECT DISTINCT ?resource WHERE { \
                    { '+ st +' \
                    }\
            } LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }
        return this.prefixes + this.query;
    }
    getMasterPropertyValues(graphName, propertyURI) {
        let st = '?s <'+ propertyURI + '>  ?v.';
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            } \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                    { '+ st +' \
                    } \
            } \
            ';
        }
        return this.prefixes + this.query;
    }
    getMultipleFilters(prevSelection) {
        let st = '', filters, tmp, i = 0, hasURIVal = 0, hasLiteralVal = 0, typedLiteralVal = '';
        let typeVal = {};
        filters = [];
        for (let key in prevSelection) {
            hasURIVal = 0;
            hasLiteralVal = 0;
            typedLiteralVal = '';
            tmp = [];
            i++;
            if(prevSelection[key].length){
                prevSelection[key].forEach(function(el){
                    typeVal = getQueryDataTypeValue(el.valueType, el.dataType, el.value);
                    tmp.push(typeVal.value);
                    typedLiteralVal = typeVal.dtype;
                    if(typedLiteralVal === 'uri'){
                        hasURIVal = 1;
                    }else{
                        hasLiteralVal = 1;
                    }
                })
                //special case: values are heterogenious, we should convert all to string and use str function then
                if(hasURIVal && hasLiteralVal) {
                    tmp = [];
                    prevSelection[key].forEach(function(el){
                        tmp.push('"' + el.value + '"');
                    });
                    filters.push('str(?v' + i + ') IN ('+ tmp.join(',') +')');
                }else{
                    if(hasURIVal){
                        filters.push('?v' + i + ' IN ('+ tmp.join(',') +')');
                    }else{
                        filters.push(typedLiteralVal+'(?v' + i + ') IN ('+ tmp.join(',') +')');
                    }
                }
                //---------
                st = st + '?s <'+ key + '>  ?v' + i + '. ';
            }
        }
        st = st + ' FILTER (' + filters.join(' && ') + ') ';
        if(!filters.length){
            //no constrain is selected
            st = '?s rdf:type ?o .';
        }
        return st;
    }
    getSideEffects(graphName, propertyURI, prevSelection) {
        let st = this.getMultipleFilters(prevSelection);
        st = st + '?s <'+ propertyURI + '>  ?v.';
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            } \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                    { '+ st +' \
                    } \
            } \
            ';
        }
        return this.prefixes + this.query;
    }
    countSecondLevelPropertyValues(graphName, propertyURI, prevSelection) {
        let st = this.getMultipleFilters(prevSelection);
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            }\
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) WHERE {\
                    { '+ st +' \
                    } \
            }\
            ';
        }
        return this.prefixes + this.query;
    }
    getSecondLevelPropertyValues(graphName, propertyURI, prevSelection, limit, offset) {
        let noffset = ((offset-1) < 0) ? 0 : (offset-1);
        let st = this.getMultipleFilters(prevSelection);
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?s WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            } LIMIT ' + limit + ' OFFSET ' + noffset;
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?s WHERE {\
                    { '+ st +' \
                    } \
            } LIMIT ' + limit + ' OFFSET ' + noffset;
        }
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
