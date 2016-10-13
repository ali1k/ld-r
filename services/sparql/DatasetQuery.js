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
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
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
        if(String(graphName)!=='' && graphName){
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?resource) AS ?total) WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            }  \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?resource) AS ?total) WHERE { \
                { '+ st +' \
                }\
            }  \
            ';
        }
        return this.prefixes + this.query;
    }
    getResourcesByType(graphName, rconfig, limit, offset) {
        let type = rconfig.resourceFocusType;
        let resourceLabelProperty;
        if(rconfig.resourceLabelProperty){
            resourceLabelProperty = rconfig.resourceLabelProperty;
        }
        //specify the right label for resources
        let optPhase = 'OPTIONAL { ?resource dcterms:title ?title .} ';
        if(resourceLabelProperty && resourceLabelProperty.length){
            optPhase = 'OPTIONAL { ?resource <' + resourceLabelProperty[0] + '> ?title .} ';
        }
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
        if(String(graphName)!=='' && graphName){
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?resource ?title ?label WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } '+ optPhase +'\
                OPTIONAL { ?resource rdfs:label ?label .}  \
            } LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?resource ?title ?label ?graphName WHERE { \
                { GRAPH ?graphName \
                    { '+ st +' \
                    }\
                } \
                UNION \
                { '+ st +' \
                }\
                OPTIONAL { ?resource dcterms:title ?title .}  \
                OPTIONAL { ?resource rdfs:label ?label .}  \
            } LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
