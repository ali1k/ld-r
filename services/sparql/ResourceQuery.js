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
        PREFIX DBpedia: <http://dbpedia.org/ontology/>
        PREFIX Schema: <http://schema.org/>
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
    createDynamicURI(datasetURI, prefix){
        let newResourceURI = datasetURI + '/' + prefix + Math.round(+new Date() / 1000);
        //do not add two slashes
        if(datasetURI.slice(-1) === '/'){
            newResourceURI = datasetURI + prefix + Math.round(+new Date() / 1000);
        }
        return newResourceURI;
    }
    getProperties(endpointParameters, graphName, resourceURI) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        this.query = `
            SELECT ?p ?o (count(DISTINCT ?extendedVal) AS ?hasExtendedValue) (SAMPLE(?olb) AS ?oLabel) (SAMPLE(?otb) AS ?oTitle) WHERE {
                ${gStart}
                    <${resourceURI}> ?p ?o .
                    OPTIONAL {?o ?uri ?extendedVal .}
                    OPTIONAL {?o rdfs:label ?ol .}
                    OPTIONAL {?o dcterms:title ?ot .}
                    BIND ( IF (BOUND (?ol), ?ol, '' )  as ?olb  ) .
                    BIND ( IF (BOUND (?ot), ?ot, '' )  as ?otb  ) .
                ${gEnd}
            } GROUP BY ?p ?o
        `;
        return this.query;
    }
    deleteResource(endpointParameters, user, graphName, resourceURI) {
        //todo: consider different value types
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        this.query = `
        DELETE {
            ${gStart}
                <${resourceURI}> ?p ?o .
            ${gEnd}
        } WHERE {
            ${gStart}
                <${resourceURI}> ?p ?o .
            ${gEnd}
        }
        `;
        return this.query;
    }
    cloneResource(endpointParameters, user, graphName, resourceURI, newResourceURI) {
        //todo: consider different value types
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let userSt = '';
        if(user && user.accountName !== 'open' && !parseInt(user.isSuperUser)){
            userSt=` ldr:createdBy <${user.id}> ;`;
        }
        let date = new Date();
        let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
        this.query = `
        INSERT {
            ${gStart}
                <${newResourceURI}> ?p ?o ;
                ldr:createdOn "${currentDate}"^^xsd:dateTime;
                ${userSt}
                ldr:cloneOf <${resourceURI}> .
            ${gEnd}
        } WHERE {
            ${gStart}
                <${resourceURI}> ?p ?o .
                FILTER (?p != ldr:cloneOf && ?p != ldr:createdOn && ?p != ldr:createdBy)
            ${gEnd}
        }
        `;
        return this.query;
    }
    newResource(endpointParameters, user, graphName, newResourceURI, templateResourceURI) {
        //todo: consider different value types
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let userSt = '';
        if(user && user.accountName !== 'open' && !parseInt(user.isSuperUser)){
            userSt=` ldr:createdBy <${user.id}> ;`;
        }
        let date = new Date();
        let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
        // use a template for resource if set
        if(templateResourceURI){
            this.query = `
            INSERT {
                ${gStart}
                    <${newResourceURI}> ?p ?o ;
                    ${userSt}
                    ldr:createdOn "${currentDate}"^^xsd:dateTime .
                ${gEnd}
            } WHERE {
                ${gStart}
                    <${templateResourceURI}> ?p ?o .
                    FILTER (?p != ldr:cloneOf && ?p != ldr:createdOn && ?p != ldr:createdBy && ?o != ldr:TemplateResource)
                ${gEnd}
            }
            `;
        } else {
            // create an empty resource
            this.query = `
            INSERT DATA {
                ${gStart}
                    <${newResourceURI}> a ldr:Resource ;
                    ldr:createdOn "${currentDate}"^^xsd:dateTime;
                    ${userSt}
                    rdfs:label "New Resource" .
                ${gEnd}
            }
            `;
        }


        return this.query;
    }
    annotateResource(endpointParameters, user, datasetURI, graphName, resourceURI, propertyURI, annotations, inNewDataset, options) {
        //todo: consider different value types
        let self = this;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let userSt = '', atypeSt ='';
        if(user && user.accountName !== 'open' && !parseInt(user.isSuperUser)){
            userSt=` ldr:createdBy <${user.id}> ;`;
        }
        let date = new Date();
        let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
        let aresources = [];
        let eresource;
        let annotationsSTR = '';
        let newDSt = '';
        //add more data if it is stored in a different dataset than the original one
        if(inNewDataset){
            newDSt = `<${resourceURI}> a  ldr:AnnotatedResource .`;
        }
        let default_api = options && options.api ? options.api : 'dbspotlight';
        let default_api_name = options && options.api ? options.api : 'DBpedia Spotlight';
        let annotation_Detail = '';
        let annotatedByURI = self.createDynamicURI(datasetURI, default_api+'_'+Math.floor((Math.random() * 1000) + 1)+'_');
        annotations.forEach((annotation, index)=>{
            eresource = '<'+self.createDynamicURI(datasetURI, 'annotation_'+index+'_'+Math.floor((Math.random() * 1000) + 1)+'_')+'>';
            aresources.push(eresource);
            let atypes = [];
            if(annotation.types){
                annotation.types.forEach((t, i)=>{
                    //only supports following vocabs
                    if(t.indexOf('DBpedia') !== -1 || t.indexOf('Schema') !== -1){
                        atypes.push(t);
                    }
                });
            }
            atypeSt ='';
            if(atypes.length){
                atypeSt = `<${annotation.uri}> a ${atypes.join(',')} .`;
            }
            if(default_api === 'spotlight'){
                annotation_Detail = `
                ldr:offset "${annotation.offset}"^^xsd:integer;
                ldr:similarityScore "${annotation.similarityScore}"^^xsd:float;
                ldr:percentageOfSecondRank "${annotation.percentageOfSecondRank}"^^xsd:float;
              `;
            }else{
                annotation_Detail = '';
            }
            annotationsSTR = annotationsSTR + `
                ${eresource} a ldr:Annotation;
                             ldr:annotationDetail <${annotatedByURI}> ;
                             ldr:surfaceForm """${annotation.surfaceForm}""";
                             ${annotation_Detail}
                             rdfs:label """${annotation.surfaceForm}""" ;
                             ldr:uri <${annotation.uri}> .
                             ${atypeSt}
             `;
        });
        let mainAnnSt = '';
        if(aresources.length){
            mainAnnSt = `<${resourceURI}> ldr:annotations ${aresources.join(',')} .`;
        }
        this.query = `
        INSERT {
            ${gStart}
                <${resourceURI}> ldr:annotatedBy  <${annotatedByURI}> .
                ${newDSt}
                <${annotatedByURI}> ${userSt} ldr:createdOn "${currentDate}"^^xsd:dateTime ; ldr:property "${propertyURI}" ; ldr:API "${default_api_name}" .
                ${mainAnnSt}
                ${annotationsSTR}
            ${gEnd}
        } WHERE {
            ${gStart}
                filter not exists {
                    <${resourceURI}> ldr:annotatedBy ?annotationInfo .
                    ?annotationInfo ldr:property "${propertyURI}" .
                }
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
    createObjectDetails (endpointParameters, user, graphName, resourceURI, propertyURI, oldObjectValue, newObjectValue, valueType, dataType, detailData) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let date = new Date();
        let currentDate = date.toISOString(); //"2011-12-19T15:28:46.493Z"
        let userSt = '';
        let dateSt = '';
        this.query= '';
        if(user && user.accountName !== 'open' && !parseInt(user.isSuperUser)){
            let dateSt = ` ldr:createdOn "${currentDate}"^^xsd:dateTime;`;
            userSt=` ldr:createdBy <${user.id}> .`;
            this.query = `
            INSERT DATA {
                ${gStart}
                    <${newObjectValue}>
                    ldr:createdOn "${currentDate}"^^xsd:dateTime;
                    ${userSt}
                ${gEnd}
            };
            `;
        }
        let self=this;
        self.query = self.query + self.deleteTriple(endpointParameters, graphName, resourceURI, propertyURI, oldObjectValue, valueType, dataType) + ' ; ' + self.addTriple(endpointParameters, graphName, resourceURI, propertyURI, newObjectValue, valueType, dataType) + ' ; ';
        for (let propURI in detailData) {
            self.query = self.query + self.deleteTriple(endpointParameters, graphName, oldObjectValue, propURI, '', detailData[propURI].valueType, detailData[propURI].dataType) + ' ; ';
            self.query = self.query + self.addTriple(endpointParameters, graphName, newObjectValue, propURI, detailData[propURI].value, detailData[propURI].valueType, detailData[propURI].dataType)+ ' ; ';
        }

        return this.query;
    }

}
export default ResourceQuery;
