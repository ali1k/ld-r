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
        //go to default graph if no graph name is given
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT count(?resource) AS ?total WHERE {\
                { GRAPH <' + graphName + '> \
                    { \
                    ?resource a < '+ type + '> . \
                    } \
                } \
            }  \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT count(?resource) AS ?total WHERE { \
                { GRAPH ?graphName \
                    { \
                    ?resource a <'+ type +'> . \
                    }\
                } \
            }  \
            ';
        }
        return this.prefixes + this.query;
    }
    getResourcesByType(graphName, type, limit, offset) {
        //go to default graph if no graph name is given
        if(String(graphName)!==''){
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?resource ?label ?title WHERE {\
                { GRAPH <' + graphName + '> \
                    { \
                    ?resource a < '+ type + '> . \
                    OPTIONAL {?resource dcterms:title ?title .} \
                    OPTIONAL {?resource rdfs:label ?label .} \
                    } \
                } \
            } ORDER BY ASC(?resource) LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?resource ?label ?title ?graphName WHERE { \
                { GRAPH ?graphName \
                    { \
                    ?resource a <'+ type +'> . \
                    OPTIONAL {?resource dcterms:title ?title .} \
                    OPTIONAL {?resource rdfs:label ?label .} \
                    }\
                } \
            } ORDER BY ASC(?resource) LIMIT ' + limit + ' OFFSET ' + offset + ' \
            ';
        }
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
