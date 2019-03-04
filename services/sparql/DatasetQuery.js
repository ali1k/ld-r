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
        PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>
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
    filterPropertyPath(propertyURI){
        if(propertyURI.indexOf('->')!== -1){
            let tmp2 =[], tmp = propertyURI.split('->');
            tmp.forEach((el)=> {
                tmp2.push('<'+el.trim()+'>');
            });
            return tmp2.join('/');
        }else{
            return '<'+ propertyURI + '>';
        }
    }
    addDataTypeToFilter(el){
        let oval = '';
        if(el.indexOf('[dt]') === -1){
            //no data type is set
            oval = (el.indexOf('http:\/\/') === -1 && el.indexOf('https:\/\/') === -1) ? '"""' +el + '"""' : '<'+el+'>';
        }else{
            //add data type to query to literal value
            let tmp = el.split('[dt]');
            oval = '"""' +tmp[0] + '"""^^<'+tmp[1]+'>'
        }
        return oval;
    }
    makeExtraTypeFilters(endpointParameters, rconfig){
        let self = this;
        let type = rconfig.resourceFocusType;
        //---to support resource focus types
        let st_extra = ' ?resource rdf:type <'+ type + '> .';
        //will get all the types
        if(!type || !type.length || (type.length && !type[0]) ){
            st_extra = '?resource a ?type .';
        }
        //if we have multiple type, get all of them
        let tmp2, typeURIs = [];
        if(type && type.length > 1){
            type.forEach(function(uri) {
                typeURIs.push('<' + uri + '>');
            });
            if(endpointParameters.type === 'stardog' || endpointParameters.type === 'sesame'){
                ///---for sesame
                tmp2 = [];
                typeURIs.forEach(function(fl){
                    tmp2.push('?type=' + fl);
                });
                st_extra = ' ?resource rdf:type ?type . FILTER (' + tmp2.join(' || ') + ')';
                //---------------
            }else{
                //---for virtuoso
                st_extra = ' ?resource rdf:type ?type . FILTER (?type IN (' + typeURIs.join(',') + '))';
            }
        }
        //-----------------------------------------------
        //handle pre constraints for a dataset
        let constraint;
        if(rconfig.constraint){
            constraint = rconfig.constraint;
        }
        let constraintPhrase = '';
        let oval = '';
        let pi = 0;
        if(constraint){
            for(let prop in constraint){
                pi++;
                if(constraint[prop].length>1){
                    let parts1 = ' ?resource ' + self.filterPropertyPath(prop) + ' ?cp' + pi +' . ';
                    let parts2 = [];
                    constraint[prop].forEach((el, index)=>{
                        oval = self.addDataTypeToFilter(el);
                        parts2.push('?cp' + pi + '=' + oval);
                    });
                    constraintPhrase = constraintPhrase + parts1 +  ' FILTER( ' + parts2.join(' || ') + ' ) ' ;
                }else{
                    oval = self.addDataTypeToFilter(constraint[prop][0]);
                    constraintPhrase = constraintPhrase + ' ?resource ' + self.filterPropertyPath(prop) + ' '+ oval + ' . ' ;
                }
            }
            st_extra = constraintPhrase + st_extra;
        }
        return st_extra;
    }
    countResourcesByType(endpointParameters, graphName, rconfig) {
        let self = this;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.makeExtraTypeFilters(endpointParameters, rconfig);
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
    getResourcesByType(endpointParameters, graphName, searchTerm, rconfig, limit, offset) {
        let self = this;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let resourceLabelProperty, resourceImageProperty, resourceGeoProperty, resourceLanguageTag;
        if(rconfig.resourceLanguageTag){
            resourceLanguageTag = rconfig.resourceLanguageTag;
        }
        if(rconfig.resourceLabelProperty){
            resourceLabelProperty = rconfig.resourceLabelProperty;
        }
        if(rconfig.resourceImageProperty){
            resourceImageProperty = rconfig.resourceImageProperty;
        }
        if(rconfig.resourceGeoProperty){
            resourceGeoProperty = rconfig.resourceGeoProperty;
        }
        let selectSt = '';
        //specify the right label for resources
        let langPhrase = '';
        if(resourceLanguageTag && resourceLanguageTag.length){
            langPhrase = ` FILTER(lang(?title)="${resourceLanguageTag[0]}")`;
        }
        let optPhase = 'OPTIONAL { ?resource dcterms:title ?title . '+langPhrase+'} ';
        let searchPhase='';
        if(searchTerm && searchTerm.length>2){
            if(searchTerm === 'ldr_showAll'){
                searchPhase =' ';
            }else{
                searchPhase = 'FILTER( regex(?title, "'+searchTerm+'", "i") || regex(?label, "'+searchTerm+'", "i") || regex(STR(?resource), "'+searchTerm+'", "i"))';
            }
        }
        let bindPhase = '';
        if(resourceLabelProperty && resourceLabelProperty.length){
            if(resourceLabelProperty.length === 1){
                optPhase = 'OPTIONAL { ?resource ' + self.filterPropertyPath(resourceLabelProperty[0]) + ' ?title .'+langPhrase+'} ';
            }else {
                optPhase = '';
                let tmpA = [];
                resourceLabelProperty.forEach(function(prop, index) {
                    optPhase = optPhase + 'OPTIONAL { ?resource ' + self.filterPropertyPath(prop) + ' ?vp'+index+' .} ';
                    tmpA.push('?vp' + index);
                });
                bindPhase = ' BIND(CONCAT('+tmpA.join(',"-",')+') AS ?title) '
            }
        }
        if(resourceImageProperty && resourceImageProperty.length){
            optPhase = optPhase + ' OPTIONAL { ?resource ' + self.filterPropertyPath(resourceImageProperty[0]) + ' ?image .} ';
            selectSt = selectSt + ' ?image';
        }
        if(resourceGeoProperty && resourceGeoProperty.length){
            optPhase = optPhase + ' OPTIONAL { ?resource ' + self.filterPropertyPath(resourceGeoProperty[0]) + ' ?geo .} ';
            selectSt = selectSt + ' ?geo';
        }
        let st = this.makeExtraTypeFilters(endpointParameters, rconfig);
        let limitOffsetPharse =`LIMIT ${limit} OFFSET ${offset}`;
        if(searchPhase){
            limitOffsetPharse = '';
        }
        if(resourceLanguageTag && resourceLanguageTag.length){
            langPhrase = ` FILTER(lang(?label)="${resourceLanguageTag[0]}")`;
        }
        this.query = `
        SELECT DISTINCT ?resource ?title ?label ${selectSt} WHERE {
            ${gStart}
                {
                    SELECT DISTINCT ?resource  WHERE {
                        ${gStart}
                            ${st}
                        ${gEnd}
                    }
                    ${limitOffsetPharse}
                }
                OPTIONAL { ?resource rdfs:label ?label . ${langPhrase}}
                ${optPhase}
                ${bindPhase}
                ${searchPhase}
            ${gEnd}

        }
        `;
        return this.prefixes + this.query;
    }
    //only gives us unannotated ones
    //todo: does not work if new and original graphs are on different endpoints
    getResourcePropForAnnotation(endpointParameters, graphName, rconfig, resourceType, propertyURI, limit, offset, inNewDataset) {
        let self = this;
        let type = resourceType ? [resourceType] : rconfig.resourceFocusType;
        let rconfig2 = {};
        rconfig2 = rconfig;
        rconfig2.resourceFocusType = type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.makeExtraTypeFilters(endpointParameters, rconfig2);
        let notExistFilterSt= `
            ?resource ldr:annotatedBy ?annotationD .
            ?annotationD ldr:property "${propertyURI}" .
        `;
        //do not care about already annotated ones if annotations are stored in a new dataset
        if(inNewDataset){
            this.query = `
            SELECT DISTINCT ?resource ?objectValue WHERE {
                {
                        {
                            SELECT DISTINCT ?resource ?objectValue WHERE {
                                    ${gStart}
                                        ${st}
                                        ?resource ${self.filterPropertyPath(propertyURI)} ?objectValue .
                                    ${gEnd}
                                    GRAPH <${inNewDataset}> {
                                        filter not exists {
                                            ${notExistFilterSt}
                                        }
                                    }
                            } LIMIT ${limit}
                        }
                }
            }
            `;
        }else{
            this.query = `
            SELECT DISTINCT ?resource ?objectValue WHERE {
                ${gStart}
                    ${st}
                    ?resource ${self.filterPropertyPath(propertyURI)} ?objectValue .
                    filter not exists {
                        ${notExistFilterSt}
                    }
                ${gEnd}
            }
            LIMIT ${limit}
            `;
        }
        //console.log(this.prefixes + this.query);
        return this.prefixes + this.query;
    }
    /* just for the record: to get both stats at the same time
    this.query = `
    SELECT DISTINCT ?atotal ?total WHERE {
        {
            SELECT (count(DISTINCT ?resource) AS ?atotal) WHERE {
                ${gStart}
                    ${st}
                    ?resource ldr:annotations ?annotation .
                    ?annotation ldr:property <${propertyURI}> .
                ${gEnd}
            }
        }
        {
            SELECT (count(DISTINCT ?resource) AS ?total) WHERE {
                ${gStart}
                    ${st}
                    ?resource <${propertyURI}> ?objectValue .
                ${gEnd}
            }
        }
    }
    `;
    */
    countTotalResourcesWithProp(endpointParameters, graphName, rconfig, resourceType, propertyURI, inNewDataset) {
        let self = this;
        let type = resourceType ? [resourceType] : rconfig.resourceFocusType;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let rconfig2 = {};
        rconfig2 = rconfig;
        rconfig2.resourceFocusType = type;
        let st = this.makeExtraTypeFilters(endpointParameters, rconfig2);
        //in case of storing a new dataset, ignore the type
        if(inNewDataset){
            st = '';
        }
        this.query = `
        SELECT (count(DISTINCT ?resource) AS ?total) WHERE {
            ${gStart}
                ${st}
                ?resource ${self.filterPropertyPath(propertyURI)} ?objectValue .
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
    countAnnotatedResourcesWithProp(endpointParameters, graphName, rconfig, resourceType, propertyURI, inNewDataset) {
        let self = this;
        let type = resourceType ? [resourceType] : rconfig.resourceFocusType;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let rconfig2 = {};
        rconfig2 = rconfig;
        rconfig2.resourceFocusType = type;
        let st = this.makeExtraTypeFilters(endpointParameters, rconfig2);
        //in case of storing a new dataset, ignore the type
        if(inNewDataset){
            st = '';
        }
        this.query = `
        SELECT (count(DISTINCT ?resource) AS ?atotal) WHERE {
            ${gStart}
                ${st}
                ?resource ldr:annotatedBy ?annotationD .
                ?annotationD ldr:property "${propertyURI}" .
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
}
export default DatasetQuery;
