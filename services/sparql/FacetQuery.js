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
    isMultiGraphFacet(propertyURI){
        //recognized by []
        let tmp0 = propertyURI.split('->[');
        if(tmp0.length > 1){
            return true;
        }else{
            return false;
        }
    }
    returnServiceGraph(str){
        let out = {service: '', graph: ''};
        let tmp = str.split('>>');
        if(tmp.length > 1){
            out.service = tmp[0];
            out.graph = tmp[1];
        }else{
            out.graph = str;
        }
        return out;
    }
    prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, tindex, filterSt){
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let self = this;
        let counter=0, qs='', tmp1, tmp0 = propertyURI.split('->[');
        tmp0.forEach((part, index)=>{
            counter++;
            tmp1 = part.split(']');
            if(tmp1.length > 1){
                //it has named graph
                //todo: use dataset instead of graph: needs loading dunamic config
                //parse the SPARQL service URI separated by >>
                //notice: >> is not tested because of the performance issues!
                let tmp2 = this.returnServiceGraph(tmp1[0]);
                if(tmp2.service){
                    if(tmp2.graph !== 'default'){
                        qs = qs + `
                        SERVICE <${tmp2.service}> {
                            GRAPH <${tmp2.graph}> {
                                ?vg${tindex}${counter-1} ${self.filterPropertyPath(tmp1[1])} ?v${(counter === tmp0.length ? tindex : 'g' + tindex + counter)} .
                                ${(counter !== tmp0.length ? '' : filterSt ? gStart + filterSt + gEnd : '')}
                            }
                        }
                        ` ;
                    }else{
                        qs = qs + `
                        SERVICE <${tmp2.service}> {
                            ?vg${tindex}${counter-1} ${self.filterPropertyPath(tmp1[1])} ?v${(counter === tmp0.length ? tindex : 'g' + tindex + counter)} .
                            ${(counter !== tmp0.length ? '' : filterSt ? gStart + filterSt + gEnd : '')}
                        }
                        ` ;
                    }
                //use case without federated query
                }else{
                    qs = qs + `
                    GRAPH <${tmp1[0]}> {
                        ?vg${tindex}${counter-1} ${self.filterPropertyPath(tmp1[1])} ?v${(counter === tmp0.length ? tindex : 'g' + tindex + counter)} .
                        ${(counter !== tmp0.length ? '' : filterSt ? gStart + filterSt + gEnd : '')}
                    }
                    ` ;
                }

            }else{
                //we assume we always start from the original graph
                //use the default graph name
                if(counter === 1){
                    //first one
                    qs = `
                        ?s ${self.filterPropertyPath(part)} ?v${(counter === tmp0.length ? tindex : 'g'+tindex+counter)} .
                        ${(counter !== tmp0.length ? '' : filterSt ? gStart + filterSt + gEnd : '')}
                    ` ;
                }else{
                    qs = qs + `
                    ${gStart}
                        ?vg${tindex}${counter-1} ${self.filterPropertyPath(part)} ?v${(counter === tmp0.length ? tindex : 'g'+tindex+counter)} .
                    ${gEnd}
                    ` ;
                }
            }
        });
        return qs;
    }
    //gets the total number of items on a facet when a property is selected from master level
    getMasterPropertyValuesCount(endpointParameters, graphName, rconfig, propertyURI) {
        let type = rconfig.type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let queryheart = '';
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', '');
        }else{
            let st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.';
            //---to support resource focus types
            let st_extra = this.makeExtraTypeFilters(endpointParameters, rconfig);
            st = st_extra + ' ' + st;
            queryheart = st;
        }

        this.query = `
        SELECT (count(DISTINCT ?v) AS ?total) WHERE {
            ${gStart}
                ${queryheart}
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
    //gets the list of items together with theit count on a facet when a property is selected from master level
    getMasterPropertyValues(endpointParameters, graphName, rconfig, propertyURI, page) {
        let type = rconfig.type;
        let queryheart = '';
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', '');
        }else{
            let st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.';
            //---to support resource focus types
            let st_extra = this.makeExtraTypeFilters(endpointParameters, rconfig);
            st = st_extra + ' ' + st;
            queryheart = st;
        }
        //notice: it limits results to first 500 items
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) ?v WHERE {
            ${gStart}
                ${queryheart}
            ${gEnd}
        } GROUP BY ?v ORDER BY DESC(?total) OFFSET ${page*500} LIMIT 500
        `;
        return this.prefixes + this.query;
    }
    getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options) {
        let self = this;
        let type = rconfig.type;
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
                        if(tmp.length && options && options.invert && options.invert[key]){
                            tmp.forEach(function(fl){
                                tmp2.push('?v' + i + '=' + fl);
                            });
                            filters.push('(' + tmp2.join(' || ') + ')');
                        }else{
                            tmp.forEach(function(fl){
                                tmp2.push('?v' + i + '!=' + fl);
                            });
                            filters.push('(' + tmp2.join(' && ') + ')');
                        }
                        //---------------
                    }else{
                        //for virtuoso and others
                        if(tmp.length && options && options.invert && options.invert[key]){
                            filters.push('str(?v' + i + ') NOT IN ('+ tmp.join(',') +')');
                        }else{
                            filters.push('str(?v' + i + ') IN ('+ tmp.join(',') +')');
                        }
                    }
                }else{
                    if(hasURIVal){
                        if(endpointParameters.type === 'stardog' || endpointParameters.type === 'sesame'){
                            ///---for sesame
                            tmp2 = [];
                            if(tmp.length && options && options.invert && options.invert[key]){
                                tmp.forEach(function(fl){
                                    tmp2.push('?v' + i + '!=' + fl);
                                });
                                filters.push('(' + tmp2.join(' && ') + ')');
                            }else{
                                tmp.forEach(function(fl){
                                    tmp2.push('?v' + i + '=' + fl);
                                });
                                filters.push('(' + tmp2.join(' || ') + ')');
                            }
                            //---------------
                        }else{
                            //for virtuoso and others
                            if(tmp.length && options && options.invert && options.invert[key]){
                                filters.push('?v' + i + ' NOT IN ('+ tmp.join(',') +')');
                            }else{
                                filters.push('?v' + i + ' IN ('+ tmp.join(',') +')');
                            }
                        }
                    }else{
                        if(endpointParameters.type === 'stardog' || endpointParameters.type === 'sesame'){
                            ///---for sesame
                            tmp2 = [];
                            if(tmp.length &&  options && options.invert && options.invert[key]){
                                tmp.forEach(function(fl){
                                    tmp2.push('?v' + i + '!=' + fl);
                                });
                                filters.push('(' + tmp2.join(' && ') + ')');
                            }else{
                                tmp.forEach(function(fl){
                                    tmp2.push('?v' + i + '=' + fl);
                                });
                                filters.push('(' + tmp2.join(' || ') + ')');
                            }
                            //---------------
                        }else{
                            //for virtuoso
                            if(tmp.length && options && options.invert && options.invert[key]){
                                filters.push(typedLiteralVal+'(?v' + i + ') NOT IN ('+ tmp.join(',') +')');
                            }else{
                                filters.push(typedLiteralVal+'(?v' + i + ') IN ('+ tmp.join(',') +')');
                            }
                        }
                    }
                }
                //---------
                if(this.isMultiGraphFacet(key)){
                    //to support browsing mutiple graphs
                    st = st + this.prepareMultiGraphQuery(endpointParameters, graphName, type, key, i, '');
                }else{
                    st = st + '?s '+ this.filterPropertyPath(key) + ' ?v' + i + '. ';
                }
            }
        }
        st = st + ' FILTER (' + filters.join(' && ') + ') ';
        //---to support resource focus types
        let st_extra = this.makeExtraTypeFilters(endpointParameters, rconfig);
        if(!filters.length){
            if(!st_extra){
                //no constrain is selected
                st = '?s rdf:type ?type .';
            }else{
                //type is selected
                st = '';
            }
        }

        return st_extra + ' ' + st;
    }
    makeExtraTypeFilters(endpointParameters, rconfig){
        let self = this;
        let type = rconfig.type;
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
        //handle pre constraints for a dataset
        let constraint;
        if(rconfig.constraint){
            constraint = rconfig.constraint;
        }
        let constraintPhrase = '';
        let oval = '';
        if(constraint){
            for(let prop in constraint){
                constraint[prop].forEach((el)=>{
                    if(el.indexOf('[dt]') === -1){
                        //no data type is set
                        oval = (el.indexOf('http:\/\/') === -1) ? '"""' +el + '"""' : '<'+el+'>';
                    }else{
                        //add data type to query to literal value
                        let tmp = el.split('[dt]');
                        oval = '"""' +tmp[0] + '"""^^<'+tmp[1]+'>'
                    }
                    constraintPhrase = constraintPhrase + ' ?s ' + self.filterPropertyPath(prop) + ' '+ oval + ' . ' ;
                });
            }
            st_extra = constraintPhrase + st_extra;
        }
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
    getSideEffects(endpointParameters, graphName, rconfig, propertyURI, prevSelection, options) {
        let queryheart = '';
        let type = rconfig.type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options);
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', st);
        }else{
            st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.' + st;
            queryheart = st;
        }
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) ?v WHERE {
            ${gStart}
                ${queryheart}
            ${gEnd}
        } GROUP BY ?v ORDER BY DESC(?total) LIMIT 500
        `;
        //console.log(this.query);
        return this.prefixes + this.query;
    }
    getSideEffectsCount(endpointParameters, graphName, rconfig, propertyURI, prevSelection, options) {
        let queryheart = '';
        let type = rconfig.type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options);
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', st);
        }else{
            st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.' + st;
            queryheart = st;
        }
        this.query = `
        SELECT (count(DISTINCT ?v) AS ?total) WHERE {
            ${gStart}
                ${queryheart}
            ${gEnd}
        }
        `;
        //console.log(this.query);
        return this.prefixes + this.query;
    }
    countSecondLevelPropertyValues(endpointParameters, graphName, rconfig, prevSelection, options) {
        let type = rconfig.type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options);
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) WHERE {
            ${gStart}
                ${st}
            ${gEnd}
        }
        `;
        //console.log(this.query);
        return this.prefixes + this.query;
    }
    getSecondLevelPropertyValues(endpointParameters, graphName, searchTerm, rtconfig, prevSelection, options, limit, offset) {
        let self = this;
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
        let searchPhase='';
        if(searchTerm && searchTerm.length>2){
            searchPhase = 'FILTER( regex(?title, "'+searchTerm+'", "i") || regex(STR(?s), "'+searchTerm+'", "i"))';
        }
        //add labels for entities
        if(labelProperty && labelProperty.length){
            selectStr = ' ?title ';
            if(labelProperty.length === 1){
                titleStr = 'OPTIONAL { ?s ' + self.filterPropertyPath(labelProperty[0]) + ' ?title .} ';
            }else {
                titleStr = '';
                let tmpA = [];
                labelProperty.forEach(function(prop, index) {
                    titleStr = titleStr + 'OPTIONAL { ?s ' + self.filterPropertyPath(prop) + ' ?vp'+index+' .} ';
                    tmpA.push('?vp' + index);
                });
                bindPhase = ' BIND(CONCAT('+tmpA.join(',"-",')+') AS ?title) '
            }
        }else{
            selectStr = ' ?title ';
            titleStr = 'OPTIONAL { ?s rdfs:label ?title .} OPTIONAL {FILTER langMatches( lang(?title), "EN" )}';
        }
        if(imageProperty && imageProperty.length){
            selectStr = selectStr + ' ?image ';
            imageStr = 'OPTIONAL { ?s ' + self.filterPropertyPath(imageProperty[0]) + ' ?image .} ';
        }
        if(geoProperty && geoProperty.length){
            selectStr = selectStr + ' ?geo ';
            geoStr = 'OPTIONAL { ?s ' + self.filterPropertyPath(geoProperty[0]) + ' ?geo .} ';
        }
        let st = this.getMultipleFilters(endpointParameters, graphName, prevSelection, rtconfig, options);
        let limitOffsetPharse =`LIMIT ${limit} OFFSET ${noffset}`;
        if(searchPhase){
            limitOffsetPharse ='';
        }
        this.query = `
        SELECT DISTINCT ?s ${selectStr} WHERE {
            ${gStart}
                {
                    SELECT DISTINCT ?s WHERE {
                        ${gStart}
                            ${st}
                        ${gEnd}
                    }
                    ${limitOffsetPharse}
                }
                ${titleStr} ${imageStr} ${geoStr} ${bindPhase} ${searchPhase}
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
}
export default FacetQuery;
