'use strict';
let prefixes, query='';
export default {
  getPrefixes: ()=> {
    /*jshint multistr: true */
    prefixes='\
    PREFIX dcterms: <http://purl.org/dc/terms/> \
    PREFIX void: <http://rdfs.org/ns/void#> \
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
     ';
    return prefixes;
  },
  getResourcesByType: (graphName, type) => {
    /*jshint multistr: true */
    query = '\
    SELECT DISTINCT ?resource WHERE { \
      { \
        GRAPH <'+ graphName +'>  { \
          ?resource a '+ type +' . \
        } \
      } \
    } ORDER BY ASC(?resource) \
    ';
    return query;
  }
};
