'use strict';
import {getQueryDataTypeValue} from '../utils/helpers';
class ResourceQuery{
    constructor() {
        this.prefixes=`
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
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
    getProperties(endpointParameters, graphName, resourceURI) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        this.query = `
            SELECT ?p ?o (count(?extendedVal) AS ?hasExtendedValue) WHERE {
                ${gStart}
                    <${resourceURI}> ?p ?o .
                    OPTIONAL {?o ?uri ?extendedVal .}
                ${gEnd}
            } GROUP BY ?p ?o ORDER BY ?p ?o
        `;
        return this.query;
    }
    cloneResource(endpointParameters, graphName, resourceURI, newResourceURI) {
        //todo: consider different value types
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        this.query = `
        INSERT {
            ${gStart}
                <${newResourceURI}> ?p ?o ; ldr:cloneOf <${resourceURI}> .
            ${gEnd}
        } WHERE {
            ${gStart}
                <${resourceURI}> ?p ?o .
                FILTER (?p != ldr:cloneOf)
            ${gEnd}
        }
        `;
        return this.query;
    }
    newResource(endpointParameters, graphName, newResourceURI) {
        //todo: consider different value types
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        this.query = `
        INSERT DATA {
            ${gStart}
                <${newResourceURI}> a ldr:Resource ; rdfs:label "New Resource" .
            ${gEnd}
        }
        `;
        return this.query;
    }
    addTriple(endpointParameters, graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        //todo: consider different value types
        let newValue, tmp = {};
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
        newValue = tmp.value;
        this.query = `
            INSERT DATA {
            ${gStart}
                <${resourceURI}> <${propertyURI}> ${newValue} .
            ${gEnd}
            }
        `;
        return this.query;
    }
    deleteTriple(endpointParameters, graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        let dtype, newValue, tmp = {};
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        if(objectValue){
            tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
            newValue = tmp.value;
            dtype = tmp.dtype;
          //if we just want to delete a specific value for multi-valued ones
            this.query = `
                DELETE {
                    ${gStart}
                        <${resourceURI}> <${propertyURI}> ?v .
                    ${gEnd}
                } WHERE {
                    ${gStart}
                        <${resourceURI}> <${propertyURI}> ?v .
                        FILTER(${dtype}(?v)=${newValue})
                    ${gEnd}
                }
            `;
        }else{
            this.query = `
                DELETE {
                    ${gStart}
                        <${resourceURI}> <${propertyURI}> ?z .
                    ${gEnd}
                } WHERE {
                    ${gStart}
                        <${resourceURI}> <${propertyURI}> ?z .
                    ${gEnd}
                }
            `;
        }
        return this.query;
    }
    deleteTriples(endpointParameters, graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.deleteTriple(endpointParameters, graphName, resourceURI, propertyURI, change.oldValue, change.valueType, change.dataType);
        });
        return self.query;
    }
    updateTriple (endpointParameters, graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType) {
        this.query = this.deleteTriple(endpointParameters, graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + ' ; ' + this.addTriple(endpointParameters, graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType);
        return this.query;
    }
    updateTriples (endpointParameters, graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.updateTriple(endpointParameters, graphName, resourceURI, propertyURI, change.oldValue, change.newValue, change.valueType, change.dataType) + ' ; ';
        });
        return self.query;
    }
    updateObjectTriples (endpointParameters, graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType, detailData) {
        let self=this;
        self.query = self.deleteTriple(endpointParameters, graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + ' ; ' + self.addTriple(endpointParameters, graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType) + ' ; ';
        for (let propURI in detailData) {
            self.query = self.query + self.deleteTriple(endpointParameters, graphName, oldObjectValue, propURI, '', detailData[propURI].valueType, detailData[propURI].dataType) + ' ; ';
            self.query = self.query + self.addTriple(endpointParameters, graphName, newObjectValue, propURI, detailData[propURI].value, detailData[propURI].valueType, detailData[propURI].dataType)+ ' ; ';
        }
        return self.query;
    }

}
export default ResourceQuery;
