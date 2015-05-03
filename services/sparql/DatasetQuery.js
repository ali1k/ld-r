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
    getResourcesByType(graphName, type) {
        /*jshint multistr: true */
        this.query = '\
        SELECT DISTINCT ?resource WHERE { \
          { \
            GRAPH <'+ graphName +'>  { \
              ?resource a '+ type +' . \
            } \
          } \
        } ORDER BY ASC(?resource) \
        ';
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
