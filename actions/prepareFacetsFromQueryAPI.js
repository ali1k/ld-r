// Parse a SPARQL query to a JSON object
let SparqlParser = require('sparqljs').Parser;
let parser = new SparqlParser();

let parseQuery = function(query){
    let parseQuery = parser.parse(query);
    //console.log(parseQuery);
    let graphName = parseQuery.where[0].name;
    ////console.log(graphName);
    ////console.log('//--------------------------------//');
    let selection = {};
    let tmpPropMap ={};
    parseQuery.where[0].patterns.forEach((el)=>{
        if(el.type === 'query'){
            el.where[0].patterns.forEach((el2)=>{
                //console.log('//--------------------------------//');
                if(el2.type === 'bgp'){
                    el2.triples.forEach((el3)=>{
                        //todo: handle property path
                        //console.log(el3.predicate);
                        if(!selection[el3.predicate]){
                            if(el3.predicate.type && el3.predicate.type=== 'path'){
                                selection[el3.predicate.items.join('->')] = [];
                                tmpPropMap[el3.object]= el3.predicate.items.join('->');
                            }else{
                                selection[el3.predicate] = [];
                                tmpPropMap[el3.object]= el3.predicate;
                            }

                        }
                        //id there is already a value
                        if(el3.object.indexOf('?v') === -1){
                            selection[el3.predicate].push({valueType:'', dataType:'', value: el3.object.replace(new RegExp('"', 'g'), '')});
                        }else{
                            tmpPropMap[el3.object]= el3.predicate;
                        }
                    });
                }
                if(el2.type === 'filter'){
                    el2.expression.args.forEach((el4)=>{
                        if(el4.operator === '&&'){
                            el4.args.forEach((el5)=>{
                                el4.args[1].forEach((el6)=>{
                                    selection[tmpPropMap[el5.args[0].args[0]]].push({valueType:'', dataType:'', value: el6.replace(new RegExp('"', 'g'), '')});
                                });
                                //console.log(el5.args);
                                //console.log('------');
                            });
                        }
                        if(el4.operator === 'in'){
                            //todo: handle array
                            //console.log(el4.args[0].args[0]);
                            //console.log(el4.args[1][0]);
                            //console.log(el4.args[0].args[0]);
                            el4.args[1].forEach((el6)=>{
                                selection[tmpPropMap[el4.args[0].args[0]]].push({valueType:'', dataType:'', value: el6.replace(new RegExp('"', 'g'), '')});
                            });
                        }
                    })
                }
            });

        }
    });
    ////console.log(selection);
    //console.log(tmpPropMap);
    //console.log(JSON.stringify(parseQuery));
    return {selection: selection, graphName: graphName};
}

export default function prepareFacetsFromQueryAPI(context, payload, done) {
    //todo: connect to API to get the query
    //for now it is hard-coded
    const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX void: <http://rdfs.org/ns/void#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT DISTINCT ?s  ?title  WHERE {
      GRAPH <http://grid.ac/20170522> {
        {
          SELECT DISTINCT ?s WHERE {
            GRAPH <http://grid.ac/20170522> {
              ?s rdf:type <http://xmlns.com/foaf/0.1/Organization> .
              ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v1.
              ?s <http://www.grid.ac/ontology/establishedYear> ?v2.
              FILTER (iri(?v1) IN (<http://www.grid.ac/ontology/Company>,<http://www.grid.ac/ontology/Healthcare>) && str(?v2) IN ("""1998+01:00""","""2001+01:00"""))
            }
          }
          LIMIT 20 OFFSET 0
        }
        OPTIONAL {
          ?s <http://www.w3.org/2000/01/rdf-schema#label> ?title .
        }
      }
    }
    `;
    let dynamicSelection = parseQuery(query);
    //context.service.read('facet.fromAPI', payload, {timeout: 20 * 1000}, function (err, res) {
    context.dispatch('LOAD_FACETS_CONFIG_FROM_API', dynamicSelection);
    done();
    //});

}
