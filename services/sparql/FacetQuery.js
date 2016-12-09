'use strict';
import {getQueryDataTypeValue} from '../utils/helpers';
class FacetQuery{
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
    getMasterPropertyValues(endpointParameters, graphName, type, propertyURI) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.';
        //---to support resource focus types
        let st_extra = this.makeExtraTypeFilters(endpointParameters, type);
        st = st_extra + ' ' + st;
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) ?v WHERE {
            ${gStart}
                ${st}
            ${gEnd}
        } GROUP BY ?v
        `;
        return this.prefixes + this.query;
    }
    getMultipleFilters(endpointParameters, prevSelection, type) {
        let st = '', filters, tmp, tmp2, i = 0, hasURIVal = 0, hasLiteralVal = 0, typedLiteralVal = '';
        let typeVal = {};
        filters = [];
        for (let key in prevSelection) {
            hasURIVal = 0;
            hasLiteralVal = 0;
            typedLiteralVal = '';
            tmp = [];
            i++;
            if(prevSelection[key].length){
                prevSelection[key].forEach(function(el){
                    typeVal = getQueryDataTypeValue(el.valueType, el.dataType, el.value);
                    tmp.push(typeVal.value);
                    typedLiteralVal = typeVal.dtype;
                    if(typedLiteralVal === 'uri'){
                        hasURIVal = 1;
                    }else{
                        hasLiteralVal = 1;
                    }
                })
                //special case: values are heterogenious, we should convert all to string and use str function then
                if(hasURIVal && hasLiteralVal) {
                    tmp = [];
                    prevSelection[key].forEach(function(el){
                        tmp.push('"' + el.value + '"');
                    });
                    if(endpointParameters.type === 'stardog' || endpointParameters.type === 'sesame'){
                        ///---for sesame
                        tmp2 = [];
                        tmp.forEach(function(fl){
                            tmp2.push('?v' + i + '=' + fl);
                        });
                        filters.push('(' + tmp2.join(' || ') + ')');
                        //---------------
                    }else{
                        //for virtuoso and others
                        filters.push('str(?v' + i + ') IN ('+ tmp.join(',') +')');
                    }
                }else{
                    if(hasURIVal){
                        if(endpointParameters.type === 'stardog' || endpointParameters.type === 'sesame'){
                            ///---for sesame
                            tmp2 = [];
                            tmp.forEach(function(fl){
                                tmp2.push('?v' + i + '=' + fl);
                            });
                            filters.push('(' + tmp2.join(' || ') + ')');
                            //---------------
                        }else{
                            //for virtuoso
                            filters.push('?v' + i + ' IN ('+ tmp.join(',') +')');
                        }
                    }else{
                        if(endpointParameters.type === 'stardog' || endpointParameters.type === 'sesame'){
                            ///---for sesame
                            tmp2 = [];
                            tmp.forEach(function(fl){
                                tmp2.push('?v' + i + '=' + fl);
                            });
                            filters.push('(' + tmp2.join(' || ') + ')');
                            //---------------
                        }else{
                            //for virtuoso
                            filters.push(typedLiteralVal+'(?v' + i + ') IN ('+ tmp.join(',') +')');
                        }
                    }
                }
                //---------
                st = st + '?s '+ this.filterPropertyPath(key) + ' ?v' + i + '. ';
            }
        }
        st = st + ' FILTER (' + filters.join(' && ') + ') ';
        if(!filters.length){
            //no constrain is selected
            st = '?s rdf:type ?type .';
        }

        //---to support resource focus types
        let st_extra = this.makeExtraTypeFilters(endpointParameters, type);
        return st_extra + ' ' + st;
    }
    makeExtraTypeFilters(endpointParameters, type){
        //---to support resource focus types
        let st_extra = ' ?s rdf:type <'+ type + '> .';
        //will get all the types
        if(!type || !type.length || (type.length && !type[0]) ){
            st_extra = '';
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
                st_extra = ' ?s rdf:type ?type . FILTER (' + tmp2.join(' || ') + ')';
                //---------------
            }else{
                //---for virtuoso
                st_extra = ' ?s rdf:type ?type . FILTER (?type IN (' + typeURIs.join(',') + '))';
            }
        }
        //-----------------------------------------------
        return st_extra;
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
    getSideEffects(endpointParameters, graphName, type, propertyURI, prevSelection) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.getMultipleFilters(endpointParameters, prevSelection, type);
        st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.' + st;
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) ?v WHERE {
            ${gStart}
                ${st}
            ${gEnd}
        } GROUP BY ?v
        `;
        return this.prefixes + this.query;
    }
    countSecondLevelPropertyValues(endpointParameters, graphName, type, propertyURI, prevSelection) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.getMultipleFilters(endpointParameters, prevSelection, type);
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) WHERE {
            ${gStart}
                ${st}
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
    getSecondLevelPropertyValues(endpointParameters, graphName, rtconfig, propertyURI, prevSelection, limit, offset) {
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let type = rtconfig.type;
        let labelProperty = rtconfig.labelProperty;
        let imageProperty = rtconfig.imageProperty;
        let geoProperty = rtconfig.geoProperty;
        let selectStr = '';
        let titleStr = '';
        let imageStr = '';
        let geoStr = '';
        let bindPhase = '';
        let noffset = (offset-1)*limit;
        //add labels for entities
        if(labelProperty && labelProperty.length){
            selectStr = ' ?title ';
            if(labelProperty.length === 1){
                titleStr = 'OPTIONAL { ?s <' + labelProperty[0] + '> ?title .} ';
            }else {
                titleStr = '';
                let tmpA = [];
                labelProperty.forEach(function(prop, index) {
                    titleStr = titleStr + 'OPTIONAL { ?s <' + prop + '> ?vp'+index+' .} ';
                    tmpA.push('?vp' + index);
                });
                bindPhase = ' BIND(CONCAT('+tmpA.join(',"-",')+') AS ?title) '
            }
        }
        if(imageProperty && imageProperty.length){
            selectStr = selectStr + ' ?image ';
            imageStr = 'OPTIONAL { ?s <' + imageProperty[0] + '> ?image .} ';
        }
        if(geoProperty && geoProperty.length){
            selectStr = selectStr + ' ?geo ';
            geoStr = 'OPTIONAL { ?s <' + geoProperty[0] + '> ?geo .} ';
        }
        let st = this.getMultipleFilters(endpointParameters, prevSelection, type);
        this.query = `
        SELECT DISTINCT ?s ${selectStr} WHERE {
            ${gStart}
                {
                    SELECT DISTINCT ?s WHERE {
                        ${gStart}
                            ${st}
                        ${gEnd}
                    }
                    LIMIT ${limit} OFFSET ${noffset}
                }
                ${titleStr} ${imageStr} ${geoStr} ${bindPhase}
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
}
export default FacetQuery;
