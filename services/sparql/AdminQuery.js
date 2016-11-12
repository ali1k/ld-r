'use strict';
import ResourceQuery from './ResourceQuery';
class AdminQuery{
    constructor() {
        this.queryObject = new ResourceQuery();
        this.prefixes = `
        PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX void: <http://rdfs.org/ns/void#>
        PREFIX pav: <http://purl.org/pav/>
        PREFIX wv: <http://vocab.org/waiver/terms/norms>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        `;
        this.query='';
    }
    getUsers(endpointParameters, graphName) {
        let {gStart, gEnd} = this.queryObject.prepareGraphName(graphName);
        this.query = `
        SELECT DISTINCT ?subject ?username ?isActive ?isSuperUser ?mbox WHERE {
            ${gStart}
                ?subject a ldr:User ;
                         foaf:accountName ?username ;
                         ldr:isActive ?isActive ;
                         ldr:isSuperUser ?isSuperUser ;
                         foaf:mbox ?mbox .
            ${gEnd}
        } ORDER BY ASC(?username)
        `;
        return this.prefixes + this.query;
    }
    activateUser(endpointParameters, graphName, resourceURI){
        this.query = this.queryObject.updateTriple(endpointParameters, graphName, resourceURI, 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isActive', '0', '1', 'literal', '');
        return this.prefixes + this.query;
    }
}
export default AdminQuery;
