'use strict';
import validUrl from 'valid-url';

class ResourceQuery{
    constructor() {
        /*jshint multistr: true */
        this.prefixes='\
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
    getProperties(graphName, resourceURI) {
        /*jshint multistr: true */
        this.query = '\
        SELECT ?p ?o (count(?extendedVal) AS ?hasExtendedValue) FROM <'+ graphName +'> WHERE { \
        <'+ resourceURI + '> ?p ?o . \
        OPTIONAL {?o ?uri ?extendedVal .} \
      } ORDER BY ?p ?o';
      return this.query;
    }
    getObjectProperties(graphName, objectURI) {
        /*jshint multistr: true */
        this.query = '\
        SELECT ?p ?o FROM <'+ graphName +'> WHERE { \
        <'+ objectURI + '> ?p ?o .\
        } ORDER BY ?p ?o';
      return this.query;
    }
    addTriple (graphName, resourceURI, propertyURI, objectValue, valueType) {
        //todo: consider different value types
      let newValue;
      if(valueType==='uri'){
        newValue='<'+objectValue+'>';
      }else{
          // automatically detect uris even in literal values
          if(validUrl.is_web_uri(objectValue)){
              newValue='<'+objectValue+'>';
          }else{
              newValue='"""'+objectValue+'"""';
          }
      }
      /*jshint multistr: true */
      this.query = '\
      INSERT DATA INTO <'+ graphName +'> { \
      <'+ resourceURI + '> <'+ propertyURI +'> '+newValue+' } ';
      return this.query;
    }
    deleteTriple(graphName, resourceURI, propertyURI, objectValue, valueType) {
        if(objectValue){
          //if we just want to delete a specific value for multi-valued ones
          if(valueType === 'uri'){
              this.query = 'DELETE FROM <'+ graphName +'> {<'+ resourceURI +'> <'+ propertyURI +'> ?uri} WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?uri . FILTER(iri(?uri)= <'+ objectValue +'> ) }';
          }else{
              //todo: handle each typed literal separately e.g. date
              this.query = 'DELETE FROM <'+ graphName +'> {<'+ resourceURI +'> <'+ propertyURI +'> ?label} WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?label . FILTER(str(?label)="""'+ objectValue +'""")}';
          }
        }else{
            this.query = 'DELETE FROM <'+ graphName +'> {<'+ resourceURI +'> <'+ propertyURI +'> ?z } WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?z } ';
        }
        return this.query;
    }
    deleteTriples(graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.deleteTriple(graphName, resourceURI, propertyURI, change.oldValue, change.valueType);
        });
        return self.query;
    }
    updateTriple (graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType) {
        this.query = this.deleteTriple(graphName, resourceURI, propertyURI, oldObjectValue, valueType) + this.addTriple(graphName, resourceURI, propertyURI, newObjectValue, valueType);
        return this.query;
    }
    updateTriples (graphName, resourceURI, propertyURI, changes) {
        let self = this;
        self.query= '';
        changes.forEach(function(change) {
            self.query = self.query + self.updateTriple(graphName, resourceURI, propertyURI, change.oldValue, change.newValue, change.valueType);
        });
        return self.query;
    }
    updateObjectTriples (graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, detailData) {
        let self=this;
        self.query = self.deleteTriple(graphName, resourceURI, propertyURI, oldObjectValue, valueType) + self.addTriple(graphName, resourceURI, propertyURI, newObjectValue, valueType) ;
        for (let propURI in detailData) {
            self.query = self.query + self.deleteTriple(graphName, oldObjectValue, propURI, '', detailData[propURI].valueType);
            self.query = self.query + self.addTriple(graphName, newObjectValue, propURI, detailData[propURI].value, detailData[propURI].valueType);
        }
        return self.query;
    }
}
export default ResourceQuery;
