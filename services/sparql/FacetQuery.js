'use strict';
import {getQueryDataTypeValue} from '../utils/helpers';
class FacetQuery{
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
    getMasterPropertyValues(endpointParameters, graphName, type, propertyURI) {
        let st = '?s <'+ propertyURI + '>  ?v.';
        //---to support resource focus types
        let st_extra = this.makeExtraTypeFilters(endpointParameters, type);
        st = st + ' ' + st_extra;
        if(String(graphName)!=='' && graphName){
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            } GROUP BY ?v \
            ';
        }else{
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                { '+ st +' \
            }  \
            } GROUP BY ?v \
            ';
        }
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
                    if(endpointParameters.type === 'sesame'){
                        ///---for sesame
                        tmp2 = [];
                        tmp.forEach(function(fl){
                            tmp2.push('?v' + i + '=' + fl);
                        });
                        filters.push('(' + tmp2.join(' || ') + ')');
                        //---------------
                    }else{
                        //for virtuoso
                        filters.push('str(?v' + i + ') IN ('+ tmp.join(',') +')');
                    }
                }else{
                    if(hasURIVal){
                        if(endpointParameters.type === 'sesame'){
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
                        if(endpointParameters.type === 'sesame'){
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
                st = st + '?s <'+ key + '>  ?v' + i + '. ';
            }
        }
        st = st + ' FILTER (' + filters.join(' && ') + ') ';
        if(!filters.length){
            //no constrain is selected
            st = '?s rdf:type ?type .';
        }

        //---to support resource focus types
        let st_extra = this.makeExtraTypeFilters(endpointParameters, type);
        return st + st_extra;
    }
    makeExtraTypeFilters(endpointParameters, type){
        //---to support resource focus types
        let st_extra = ' ?s a <'+ type + '> .';
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
            if(endpointParameters.type === 'sesame'){
                ///---for sesame
                tmp2 = [];
                typeURIs.forEach(function(fl){
                    tmp2.push('?type=' + fl);
                });
                st_extra = ' ?s a ?type . FILTER (' + tmp2.join(' || ') + ')';
                //---------------
            }else{
                //---for virtuoso
                st_extra = ' ?s a ?type . FILTER (?type IN (' + typeURIs.join(',') + '))';
            }
        }
        //-----------------------------------------------
        return st_extra;
    }
    getSideEffects(endpointParameters, graphName, type, propertyURI, prevSelection) {
        let st = this.getMultipleFilters(endpointParameters, prevSelection, type);
        st = st + '?s <'+ propertyURI + '>  ?v.';
        if(String(graphName)!=='' && graphName){
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            } GROUP BY ?v \
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) ?v WHERE {\
                { '+ st +' \
                } \
            } GROUP BY ?v \
            ';
        }
        return this.prefixes + this.query;
    }
    countSecondLevelPropertyValues(endpointParameters, graphName, type, propertyURI, prevSelection) {
        let st = this.getMultipleFilters(endpointParameters, prevSelection, type);
        if(String(graphName)!=='' && graphName){
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st +' \
                    } \
                } \
            }\
            ';
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT (count(?s) AS ?total) WHERE {\
                { '+ st +' \
                } \
            }\
            ';
        }
        return this.prefixes + this.query;
    }
    getSecondLevelPropertyValues(endpointParameters, graphName, rtconfig, propertyURI, prevSelection, limit, offset) {
        let type = rtconfig.type;
        let labelProperty = rtconfig.labelProperty;
        let selectStr = '';
        let titleStr = '';
        let bindPhase = '';
        let noffset = (offset-1)*limit;
        //add labels for entities
        if(labelProperty && labelProperty.length){
            selectStr = ' ?title ';
            if(labelProperty.length === 1){
                titleStr = 'OPTIONAL { ?resource <' + labelProperty[0] + '> ?title .} ';
            }else {
                titleStr = '';
                let tmpA = [];
                labelProperty.forEach(function(prop, index) {
                    titleStr = titleStr + 'OPTIONAL { ?resource <' + prop + '> ?vp'+index+' .} ';
                    tmpA.push('?vp' + index);
                });
                bindPhase = ' BIND(CONCAT('+tmpA.join(',"-",')+') AS ?title) '
            }
        }
        let st = this.getMultipleFilters(endpointParameters, prevSelection, type);
        if(String(graphName)!=='' && graphName){
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?s ' + selectStr + ' WHERE {\
                { GRAPH <' + graphName + '> \
                    { '+ st + titleStr + bindPhase +' \
                    } \
                } \
            } LIMIT ' + limit + ' OFFSET ' + noffset;
        }else{
            /*jshint multistr: true */
            this.query = '\
            SELECT DISTINCT ?s ' + selectStr + ' WHERE {\
                { '+ st + titleStr + bindPhase + ' \
                } \
            } LIMIT ' + limit + ' OFFSET ' + noffset;
        }
        return this.prefixes + this.query;
    }
}
export default FacetQuery;
