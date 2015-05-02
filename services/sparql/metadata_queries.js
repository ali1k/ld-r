'use strict';
//Todo: consider URI objects not only literals
var prefixes, query='';
module.exports = {
  getPrefixes: function(){
    /*jshint multistr: true */
    prefixes='\
    PREFIX risis: <http://risis.eu/> \
    PREFIX dcterms: <http://purl.org/dc/terms/> \
    PREFIX void: <http://rdfs.org/ns/void#> \
    PREFIX pav: <http://purl.org/pav/> \
    PREFIX wv: <http://vocab.org/waiver/terms/norms> \
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
    PREFIX risisVoid: <http://rdf.risis.eu/dataset/risis/1.0/void.ttl#> \
     ';
    return prefixes;
  },
  getDatasetsList: function(){
    /*jshint multistr: true */
    query = '\
    SELECT DISTINCT ?dataset ?subject ?title WHERE { \
      { \
        GRAPH risisVoid:  { \
          risisVoid:risis_rdf_dataset void:subset ?dataset . \
        } \
        GRAPH ?dataset {?subject a void:Dataset. ?subject dcterms:title ?title .} \
      } \
    } ORDER BY ASC(?title) \
    ';
    return query;
  },
  //gets the title of dataset for other tabs than general metadata
  getDatasetTitle: function(datasetName){
    var namedGraph='http://rdf.risis.eu/dataset/'+datasetName+'/1.0/void.ttl#';
    var resourceURI=namedGraph+datasetName+'_rdf_dataset';
    /*jshint multistr: true */
    query = '\
    SELECT ?title FROM <'+ namedGraph +'> WHERE { \
    <'+ resourceURI + '> dcterms:title ?title . \
    } ';
    return query;
  },
  //maps the url parameter to literal value in triple store for categories
  metadataCategories:{'general':'General', 'access':'Access', 'structural': 'Structure and Content'},
  //todo: handle language tags if necessary
  getDatasetDescription: function(datasetName, category){
    var namedGraph='http://rdf.risis.eu/dataset/'+datasetName+'/1.0/void.ttl#';
    var resourceURI=namedGraph+datasetName+'_rdf_dataset';
    if(!category){category='general';}
    /*jshint multistr: true */
    query = '\
    SELECT ?p ?o ?hint ?prefLabel (group_concat(distinct ?option ; separator = ",") AS ?defaultOptions) (count(?extendedVal) AS ?hasExtendedValue) FROM <'+ namedGraph +'> WHERE { \
    <'+ resourceURI + '> ?p ?o . \
    ?p risis:metadataCategory "'+this.metadataCategories[category]+'"@en . \
    OPTIONAL {?p risis:hint ?hint .} \
    OPTIONAL {?p skos:prefLabel ?prefLabel .} \
    OPTIONAL {?p risis:defaultOption ?option .} \
    OPTIONAL {?o ?uri ?extendedVal .} \
  } ORDER BY ?p ?o';
    return query;
  },
  addMetadata: function(resourceURI, datasetName, propertyURI, newValue, valueType){
    var namedGraph='http://rdf.risis.eu/dataset/'+datasetName+'/1.0/void.ttl#';
    //check if it is first-level resource not object resource
    if(!resourceURI){
      resourceURI=namedGraph+datasetName+'_rdf_dataset';
    }
    if(valueType==='uri'){
      newValue='<'+newValue+'>';
    }else{
      newValue='"'+newValue+'"';
    }
    /*jshint multistr: true */
    query = '\
    INSERT DATA INTO <'+ namedGraph +'> { \
    <'+ resourceURI + '> <'+ propertyURI +'> '+newValue+' } ';
    return query;
  },
  deleteMetadata: function(resourceURI, datasetName, propertyURI, specificValue, valueType){
    var namedGraph='http://rdf.risis.eu/dataset/'+datasetName+'/1.0/void.ttl#';
    if(!resourceURI){
      // it is first level property
      resourceURI=namedGraph+datasetName+'_rdf_dataset';
    }else{
      //it is an object property
      //we assume that object properties do not have duplicate props
      specificValue=0;
    }
    /*jshint multistr: true */
    if(specificValue){
      //if we just want to delete a specific value for multi-valued ones
      if(valueType==='uri'){
        query='DELETE FROM <'+ namedGraph +'> {<'+ resourceURI +'> <'+ propertyURI +'> ?uri} WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?uri . FILTER(iri(?uri)= <'+ specificValue +'> ) }';
      }else{
        //todo: handle each typed literal separately e.g. date
        query='DELETE FROM <'+ namedGraph +'> {<'+ resourceURI +'> <'+ propertyURI +'> ?label} WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?label . FILTER(str(?label)="'+ specificValue +'")}';
      }
    }else{
      query='DELETE FROM <'+ namedGraph +'> {<'+ resourceURI +'> <'+ propertyURI +'> ?z } WHERE { <'+ resourceURI +'> <'+ propertyURI +'> ?z } ';
    }
    return query;
  },
  updateMetadata: function(resourceURI,datasetName, propertyURI, oldValue, newValue, valueType){
    query=this.deleteMetadata(resourceURI, datasetName, propertyURI, oldValue, valueType) + this.addMetadata(resourceURI, datasetName, propertyURI, newValue, valueType);
    // console.log(query);
    return query;
  },
  batchUpdateMetadata: function(resourceURI, propertyURI, oldValue, newValue, valueType, extended){
    var self=this;
    query=this.deleteMetadata(resourceURI, propertyURI, oldValue, valueType) + this.addMetadata(resourceURI, propertyURI, newValue, valueType);
    var extendedObj= JSON.parse(extended);
    extendedObj.forEach(function(el) {
      query=query + self.deleteMetadata(oldValue, el.propertyURI, 0, 0);
      query=query + self.addMetadata(newValue, el.propertyURI, el.value, el.valueType);
    });
    // console.log(query);
    return query;
  },
  getMetadataOptions: function(propertyURI){
    /*jshint multistr: true */
    query = '\
    SELECT ?option WHERE { \
    <'+ propertyURI + '> risis:defaultOption ?option . \
    } ORDER BY ?option';
    return query;
  },
  getObjectProperties: function(datasetName, objectURI){
    var namedGraph='http://rdf.risis.eu/dataset/'+datasetName+'/1.0/void.ttl#';
    /*jshint multistr: true */
    query = '\
    SELECT ?p ?o ?hint ?prefLabel (group_concat(distinct ?option ; separator = ",") AS ?defaultOptions) FROM <'+ namedGraph +'> WHERE { \
    <'+ objectURI + '> ?p ?o .\
    OPTIONAL {?p risis:hint ?hint .} \
    OPTIONAL {?p skos:prefLabel ?prefLabel .} \
    OPTIONAL {?p risis:defaultOption ?option .} \
    } ORDER BY ?p ?o';
    return query;
  },
  //can add any desirable property here
  addDefaultObjectProperties: function(datasetName, objectURI){
    query= this.addMetadata(objectURI, datasetName, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://xmlns.com/foaf/0.1/Person', 'uri');
    query= query+ this.addMetadata(objectURI, datasetName, 'http://www.w3.org/2000/01/rdf-schema#label', 'Name', 'literal');
    query= query+ this.addMetadata(objectURI, datasetName, 'http://xmlns.com/foaf/0.1/mbox', 'emailName@hostName.com', 'uri');
    return query;
  }
};
