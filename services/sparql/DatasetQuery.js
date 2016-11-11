'use strict';
import {getQueryDataTypeValue} from '../utils/helpers';
class DatasetQuery{
    constructor() {
        this.prefixes=`
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX void: <http://rdfs.org/ns/void#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        `;
        this.query='';
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
    countResourcesByType(endpointParameters, graphName, type) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = '?resource a <'+ type + '> .';
        //will get all the types
        if(!type.length || (type.length && !type[0]) ){
            st = '?resource a ?type .';
        }
        //if we have multiple type, get all of them
        let typeURIs = [];
        if(type.length > 1){
            type.forEach(function(uri) {
                typeURIs.push('<' + uri + '>');
            });
            st = '?resource a ?type . FILTER (?type IN (' + typeURIs.join(',') + '))';
        }
        //go to default graph if no graph name is given
        this.query = `
        SELECT (count(?resource) AS ?total) WHERE {
            ${gStart}
                ${st}
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
    getResourcesByType(endpointParameters, graphName, rconfig, limit, offset) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let type = rconfig.resourceFocusType;
        let resourceLabelProperty;
        if(rconfig.resourceLabelProperty){
            resourceLabelProperty = rconfig.resourceLabelProperty;
        }
        //specify the right label for resources
        let optPhase = 'OPTIONAL { ?resource dcterms:title ?title .} ';
        let bindPhase = '';
        if(resourceLabelProperty && resourceLabelProperty.length){
            if(resourceLabelProperty.length === 1){
                optPhase = 'OPTIONAL { ?resource <' + resourceLabelProperty[0] + '> ?title .} ';
            }else {
                optPhase = '';
                let tmpA = [];
                resourceLabelProperty.forEach(function(prop, index) {
                    optPhase = optPhase + 'OPTIONAL { ?resource <' + prop + '> ?vp'+index+' .} ';
                    tmpA.push('?vp' + index);
                });
                bindPhase = ' BIND(CONCAT('+tmpA.join(',"-",')+') AS ?title) '
            }
        }
        let st = '?resource a <'+ type + '> .';
        //will get all the types
        if(!type.length || (type.length && !type[0]) ){
            st = '?resource a ?type .';
        }
        //if we have multiple type, get all of them
        let typeURIs = [];
        if(type.length > 1){
            type.forEach(function(uri) {
                typeURIs.push('<' + uri + '>');
            });
            st = '?resource a ?type . FILTER (?type IN (' + typeURIs.join(',') + '))';
        }
        this.query = `
        SELECT DISTINCT ?resource ?title ?label WHERE {
            ${gStart}
                ${st}
                OPTIONAL { ?resource rdfs:label ?label .} ${optPhase} ${bindPhase}
            ${gEnd}

        } LIMIT ${limit} OFFSET ${offset}
        `;
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
