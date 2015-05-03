'use strict';
class ResourceQuery{
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
    getProperties(graphName, resourceURI) {
        /*jshint multistr: true */
        this.query = '\
        SELECT ?p ?o (count(?extendedVal) AS ?hasExtendedValue) FROM <'+ graphName +'> WHERE { \
        <'+ resourceURI + '> ?p ?o . \
        OPTIONAL {?o ?uri ?extendedVal .} \
      } ORDER BY ?p ?o';
      return this.prefixes + this.query;
    }
}
export default ResourceQuery;
