'use strict';
import {getQueryDataTypeValue} from '../utils/helpers';
class ResourceQuery{
    constructor() {
        /*jshint multistr: true */
        this.prefixes='\
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
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
    getUpdateTripleQuery(endpointType, graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType) {
        switch (endpointType) {
            case 'sesame':
                return this.updateTripleForSesame(graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType);
                break;
            default:
                return this.updateTriple(graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType);
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
    addTriple (graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        //todo: consider different value types
      let newValue, tmp = {};
      let ex = 'INTO <'+ graphName +'>';
      if(!graphName){
          ex ='';
      }
      tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
      newValue = tmp.value;
      /*jshint multistr: true */
      this.query = '\
      INSERT DATA ' + ex + ' { \
      <'+ resourceURI + '> <'+ propertyURI +'> '+ newValue +' } ';
      return this.query;
    }
    deleteTriple(graphName, resourceURI, propertyURI, objectValue, valueType, dataType) {
        let dtype, newValue, tmp = {};
        let ex = 'FROM <'+ graphName +'>';
        if(!graphName){
            ex ='';
        }
        if(objectValue){
            tmp = getQueryDataTypeValue(valueType, dataType, objectValue);
            newValue = tmp.value;
            dtype = tmp.dtype;
          //if we just want to delete a specific value for multi-valued ones
          this.query = 'DELETE ' + ex + ' {<'+ resourceURI +'> <'+ propertyURI +'> ?v} WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?v . FILTER(' + dtype + '(?v)= '+ newValue +' ) }';
        }else{
            this.query = 'DELETE ' + ex + ' {<'+ resourceURI +'> <'+ propertyURI +'> ?z } WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?z } ';
        }
        return this.query;
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
        /*
        let ex1 = 'FROM <'+ graphName +'>', ex2 = 'INTO <'+ graphName +'>';
        if(!graphName){
            ex1 = '';
            ex2 = '';
        }
        if(oldObjectValue){
            let tmp1 = getQueryDataTypeValue(valueType, dataType, oldObjectValue);
            let oldValue = tmp1.value;
            let tmp2 = getQueryDataTypeValue(valueType, dataType, newObjectValue);
            let newValue = tmp2.value;
            let dtype = tmp1.dtype;
          //if we just want to delete a specific value for multi-valued ones
          this.query = 'DELETE ' + ex1 + ' {<'+ resourceURI +'> <'+ propertyURI +'> ?v} INSERT ' + ex2 + ' { <'+ resourceURI + '> <'+ propertyURI +'> '+ newValue +' } WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?v . FILTER(' + dtype + '(?v)= '+ oldValue +' ) }';
        }
        */
        this.query = this.deleteTriple(graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + ';' + this.addTriple(graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType) + ';';
        return this.query;    }
    updateTriples (graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.updateTriple(graphName, resourceURI, propertyURI, change.oldValue, change.newValue, change.valueType, change.dataType);
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
}
export default ResourceQuery;
