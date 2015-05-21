'use strict';
class AdminQuery{
    constructor() {
        /*jshint multistr: true */
        this.prefixes = '\
        PREFIX ldReactor: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#> \
        PREFIX dcterms: <http://purl.org/dc/terms/> \
        PREFIX void: <http://rdfs.org/ns/void#> \
        PREFIX pav: <http://purl.org/pav/> \
        PREFIX wv: <http://vocab.org/waiver/terms/norms> \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
        ';
        this.query='';
    }
    getUsers(graphName) {
        /*jshint multistr: true */
        this.query = '\
        SELECT DISTINCT ?subject ?username ?isActive FROM <'+ graphName +'> WHERE {\
                { \
                ?subject a foaf:Person . \
                ?subject foaf:accountName ?username . \
                ?subject ldReactor:isActive ?isActive . \
                } \
        } ORDER BY ASC(?username)\
        ';
        return this.prefixes + this.query;
    }
}
export default AdminQuery;
