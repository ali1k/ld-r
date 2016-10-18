'use strict';
class DBpediaQuery{
    constructor() {
        /*jshint multistr: true */
        this.prefixes='\
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
        PREFIX owl: <http://www.w3.org/2002/07/owl#> \
        PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
        ';
        this.query='';
    }
    getPrefixes() {
        return this.prefixes;
    }
    getCoordinates (uris) {
        let output = [];
        uris.forEach(function(uri) {
            output.push('<' + uri + '>');
        });
        /*jshint multistr: true */
        this.query='\
        SELECT DISTINCT ?s SAMPLE(?lat) AS ?lat SAMPLE(?long) AS ?long WHERE { \
        ?s geo:lat ?lat . \
        ?s geo:long ?long . \
        FILTER (?s IN ('+ output.join(',') +') ) \
        }';
        return this.query;
    }
}
export default DBpediaQuery;
