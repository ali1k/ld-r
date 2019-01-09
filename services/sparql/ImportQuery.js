'use strict';
import validUrl from 'valid-url';
class ImportQuery{
    constructor() {
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
    getPrefixes() {
        return this.prefixes;
    }
    prepareGraphName(graphName){
        let gStart = 'GRAPH <'+ graphName +'> { ';
        let gEnd = ' } ';
        if(!graphName || graphName === 'default'){
            gStart =' ';
            gEnd = ' ';
        }
        return {gStart: gStart, gEnd: gEnd}
    }
    csvBatchInsert(endpointParameters, user, graphName, jsonld) {
        //todo: consider different value types
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let userSt = '';
        if(user && user.accountName !== 'open' && !parseInt(user.isSuperUser)){
            userSt=` ldr:createdBy <${user.id}> ;`;
        }
        let date = new Date();
        let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
        jsonld['@graph'].forEach((node, index)=>{
            let propsSt = '';
            for(let prop in node){
                if(prop !== '@type' && prop !=='@id'){
                  propsSt = propsSt + `${validUrl.is_web_uri(prop) ? '<'+prop+'>': prop} ${validUrl.is_web_uri(node[prop]) ? '<'+node[prop]+'>': '"""'+node[prop]+'"""'} ; `;
                }
            }
            this.query = this.query + `
            INSERT DATA {
                ${gStart}
                    ${node['@id']} a ${node['@type']} ;
                    ${propsSt}
                    ${userSt}
                    ldr:createdOn "${currentDate}"^^xsd:dateTime .
                ${gEnd}
            };
            `;
        });
        //add prefixes
        let prefixes = '';
        //add ldr prefix
        if(!jsonld['@context']['ldr']){
            prefixes = 'PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>';
        }
        for(let prop in jsonld['@context']){
            let val = jsonld['@context'][prop];
            if((typeof val) === 'string'){
                prefixes = prefixes + `
                PREFIX ${prop}: <${val}>
                `;
            }
        }
        return prefixes + this.query;
    }
}
export default ImportQuery;
