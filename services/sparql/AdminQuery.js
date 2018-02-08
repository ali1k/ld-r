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
        SELECT DISTINCT ?subject ?username ?isActive ?firstName ?lastName ?created (group_concat(distinct ?member ; separator = ",") AS ?membership) ?isSuperUser ?mbox WHERE {
            ${gStart}
                ?subject a ldr:User ;
                    foaf:accountName ?username ;
                    ldr:isActive ?isActive ;
                    foaf:firstName ?firstName ;
                    foaf:lastName ?lastName ;
                    foaf:member ?member ;
                    ldr:isSuperUser ?isSuperUser ;
                    foaf:mbox ?mbox .
                 OPTIONAL {?subject dcterms:created ?created .}
            ${gEnd}

        } 
        #to fix stardog group_concat bug
        GROUP BY ?subject ?username ?isActive ?firstName ?lastName ?created ?isSuperUser ?mbox  
        ORDER BY DESC(?created)
        `;
        return this.prefixes + this.query;
    }
    activateUser(endpointParameters, graphName, resourceURI){
        this.query = this.queryObject.updateTriple(endpointParameters, graphName, resourceURI, 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#isActive', '0', '1', 'literal', '');
        return this.prefixes + this.query;
    }
    addDatasetEditor(endpointParameters, graphName, user, dataset, bnode) {
        let {gStart, gEnd} = this.queryObject.prepareGraphName(graphName);
        this.query = `
        INSERT {
            ${gStart}
                <${user}> ldr:editorOf <${bnode}> .
                <${bnode}> ldr:scope "D" ; ldr:dataset <${dataset}> .
            ${gEnd}
        } WHERE {
            ${gStart}
                <${user}> ?p ?o .
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
}
export default AdminQuery;
