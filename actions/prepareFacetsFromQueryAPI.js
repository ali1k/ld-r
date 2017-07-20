import {navigateAction} from 'fluxible-router';
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
    if(parseQuery.where[0].patterns && Array.isArray(parseQuery.where[0].patterns)){
        parseQuery.where[0].patterns.forEach((el)=>{
            if(el.type === 'query'){
                if(el.where[0].patterns && Array.isArray(el.where[0].patterns)){
                    el.where[0].patterns.forEach((el2)=>{
                        //console.log('//--------------------------------//');
                        if(el2.type === 'bgp'){
                            if (el2.triples && Array.isArray(el2.triples)){
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
                        }
                        if(el2.type === 'filter'){
                            if (el2.expression.args && Array.isArray(el2.expression.args)){
                                el2.expression.args.forEach((el4)=>{
                                    if(el4.operator === '&&'){
                                        if (el4.args && Array.isArray(el4.args)){
                                            el4.args.forEach((el5)=>{
                                                if (el4.args[1] && Array.isArray(el4.args[1])){
                                                    el4.args[1].forEach((el6)=>{
                                                        selection[tmpPropMap[el5.args[0].args[0]]].push({valueType:'', dataType:'', value: el6.replace(new RegExp('"', 'g'), '')});
                                                    });
                                                    //console.log(el5.args);
                                                    //console.log('------');
                                                }
                                            });
                                        }
                                    }
                                    if(el4.operator === 'in'){
                                        //todo: handle array
                                        //console.log(el4.args[0].args[0]);
                                        //console.log(el4.args[1][0]);
                                        //console.log(el4.args[0].args[0]);
                                        if (el4.args[1] && Array.isArray(el4.args[1])){
                                            el4.args[1].forEach((el6)=>{
                                                selection[tmpPropMap[el4.args[0].args[0]]].push({valueType:'', dataType:'', value: el6.replace(new RegExp('"', 'g'), '')});
                                            });
                                        }

                                    }
                                })
                            }
                        }
                    });
                }


            }
        });
    }

    ////console.log(selection);
    //console.log(tmpPropMap);
    //console.log(JSON.stringify(parseQuery));
    return {selection: selection, graphName: graphName};
}
let parsed;
export default function prepareFacetsFromQueryAPI(context, payload, done) {
    context.service.read('facet.fromAPI', payload, {timeout: 20 * 1000}, function (err, res) {
        parsed = parseQuery(res.query);
        context.dispatch('LOAD_FACETS_CONFIG_FROM_API', parsed);
        if(payload.redirect){
            context.executeAction(navigateAction, {
                url: '/browse/'+ encodeURIComponent(parsed.graphName) + '/' + encodeURIComponent(payload.apiFlag)
            });
            done();
        }
        done();

    });

}
