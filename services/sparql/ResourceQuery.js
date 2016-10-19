'use strict';
import {getQueryDataTypeValue} from '../utils/helpers';
class ResourceQuery{
    constructor() {
        /*jshint multistr: true */
        this.prefixes='\
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
        PREFIX owl: <http://www.w3.org/2002/07/owl#> \
        PREFIX dcterms: <http://purl.org/dc/terms/> \
        PREFIX void: <http://rdfs.org/ns/void#> \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
         ';
        this.query='';
    }
    getPrefixes() {
        return this.prefixes;
    }
    getAddTripleQuery(endpointParameters, graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        switch (endpointParameters.type) {
            case 'sesame':
                return this.addTripleForSesame(graphName, resourceURI, propertyURI, objectValue, valueType, dataType);
                break;
            default:
                return this.addTriple(graphName, resourceURI, propertyURI, objectValue, valueType, dataType);
        }
    }
    getDeleteTripleQuery(endpointParameters, graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        switch (endpointParameters.type) {
            case 'sesame':
                return this.deleteTripleForSesame(graphName, resourceURI, propertyURI, objectValue, valueType, dataType);
                break;
            default:

                return this.deleteTriple(graphName, resourceURI, propertyURI, objectValue, valueType, dataType);
        }
    }
    getDeleteTriplesQuery(endpointParameters, graphName, resourceURI, propertyURI, changes) {
        switch (endpointParameters.type) {
            case 'sesame':
                return this.deleteTriplesForSesame(graphName, resourceURI, propertyURI, changes);
                break;
            default:
                return this.deleteTriples(graphName, resourceURI, propertyURI, changes);
        }
    }
    getUpdateTripleQuery(endpointParameters, graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType) {
        switch (endpointParameters.type) {
            case 'sesame':
                return this.updateTripleForSesame(graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType);
                break;
            default:
                return this.updateTriple(graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType);
        }
    }
    getUpdateTriplesQuery(endpointParameters, graphName, resourceURI, propertyURI, changes) {
        switch (endpointParameters.type) {
            case 'sesame':
                return this.updateTriplesForSesame(graphName, resourceURI, propertyURI, changes);
                break;
            default:
                return this.updateTriples(graphName, resourceURI, propertyURI, changes);
        }
    }
    getUpdateObjectTriplesForSesame(endpointParameters, graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType, detailData) {
        switch (endpointParameters.type) {
            case 'sesame':
                return this.updateObjectTriplesForSesame(graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType, detailData);
                break;
            default:
                return this.updateObjectTriples(graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType, detailData);
        }
    }
    getProperties(graphName, resourceURI) {
        let ex = 'FROM <'+ graphName +'>';
        if(!graphName){
            ex ='';
        }
        /*jshint multistr: true */
        this.query = '\
        SELECT ?p ?o (count(?extendedVal) AS ?hasExtendedValue) ' + ex + ' WHERE { \
        <'+ resourceURI + '> ?p ?o . \
        OPTIONAL {?o ?uri ?extendedVal .} \
    } GROUP BY ?p ?o ORDER BY ?p ?o';
      return this.query;
    }
    addTripleForSesame (graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        //todo: consider different value types
      let newValue, tmp = {};
      let graph = 'GRAPH <'+ graphName +'> {';
      if(!graphName){
          graph ='{';
      }
      tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
      newValue = tmp.value;
      /*jshint multistr: true */
      this.query = '\
      INSERT DATA { \
      ' + graph  +'<'+ resourceURI + '> <'+ propertyURI +'> '+ newValue +' } }';
      return this.query;
    }
    addTriple(graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        //todo: consider different value types
      let newValue, tmp = {};
      let graph = 'INTO <'+ graphName +'> ';
      if(!graphName){
          graph ='';
      }
      tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
      newValue = tmp.value;
      /*jshint multistr: true */
      this.query = '\
      INSERT DATA ' + graph + '{ \
      <'+ resourceURI + '> <'+ propertyURI +'> '+ newValue +' } ';
      return this.query;
    }
    deleteTripleForSesame(graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        let dtype, newValue, tmp = {};
        let graph = 'GRAPH <'+ graphName +'> {';
        if(!graphName){
            graph ='{';
        }
        if(objectValue){
            tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
            newValue = tmp.value;
            dtype = tmp.dtype;
          //if we just want to delete a specific value for multi-valued ones
          this.query = 'DELETE  { '+ graph  +'<'+ resourceURI +'> <'+ propertyURI +'> ?v} } WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?v . FILTER(' + dtype + '(?v)= '+ newValue +' ) } ';
        }else{
            this.query = 'DELETE { ' + graph + '<'+ resourceURI +'> <'+ propertyURI +'> ?z } } WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?z }';
        }
        return this.query;
    }
    deleteTriple(graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        let dtype, newValue, tmp = {};
        let graph = 'FROM <'+ graphName +'> ';
        if(!graphName){
            graph ='';
        }
        if(objectValue){
            tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
            newValue = tmp.value;
            dtype = tmp.dtype;
          //if we just want to delete a specific value for multi-valued ones
          this.query = 'DELETE ' + graph + '{ <'+ resourceURI +'> <'+ propertyURI +'> ?v } WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?v . FILTER(' + dtype + '(?v)= '+ newValue +' ) } ';
        }else{
            this.query = 'DELETE ' + graph + '{ <'+ resourceURI +'> <'+ propertyURI +'> ?z }  WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?z }';
        }
        return this.query;
    }
    deleteTriplesForSesame (graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.deleteTripleForSesame(graphName, resourceURI, propertyURI, change.oldValue, change.valueType, change.dataType);
        });
        return self.query;
    }
    deleteTriples(graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.deleteTriple(graphName, resourceURI, propertyURI, change.oldValue, change.valueType, change.dataType);
        });
        return self.query;
    }
    updateTriple (graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType) {
        this.query = this.deleteTriple(graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + this.addTriple(graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType);
        return this.query;
    }
    updateTripleForSesame (graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType) {
        this.query = this.deleteTripleForSesame(graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + ';' + this.addTripleForSesame(graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType) + ';';
        return this.query;    }
    updateTriples (graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.updateTriple(graphName, resourceURI, propertyURI, change.oldValue, change.newValue, change.valueType, change.dataType);
        });
        return self.query;
    }
    updateTriplesForSesame (graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.updateTripleForSesame(graphName, resourceURI, propertyURI, change.oldValue, change.newValue, change.valueType, change.dataType);
        });
        return self.query;
    }
    updateObjectTriples (graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType, detailData) {
        let self=this;
        self.query = self.deleteTriple(graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + self.addTriple(graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType) ;
        for (let propURI in detailData) {
            self.query = self.query + self.deleteTriple(graphName, oldObjectValue, propURI, '', detailData[propURI].valueType, detailData[propURI].dataType);
            self.query = self.query + self.addTriple(graphName, newObjectValue, propURI, detailData[propURI].value, detailData[propURI].valueType, detailData[propURI].dataType);
        }
        return self.query;
    }
    updateObjectTriplesForSesame (graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType, detailData) {
        let self=this;
        self.query = self.deleteTripleForSesame (graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + ';' + self.addTripleForSesame(graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType) + ';';
        for (let propURI in detailData) {
            self.query = self.query + self.deleteTripleForSesame (graphName, oldObjectValue, propURI, '', detailData[propURI].valueType, detailData[propURI].dataType)+ ';';
            self.query = self.query + self.addTripleForSesame (graphName, newObjectValue, propURI, detailData[propURI].value, detailData[propURI].valueType, detailData[propURI].dataType)+ ';';
        }
        return self.query;
    }
}
export default ResourceQuery;
