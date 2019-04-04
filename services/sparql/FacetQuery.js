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
    getPropertyLabel(uri) {
        let property = '';
        let tmp = uri;
        //todo: handle multigraph labels
        let tmp001, tmp01 = tmp.split('->[');
        if(tmp01.length > 1){
            tmp001 = tmp.split(']');
            tmp = tmp001[tmp001.length -1];
        }
        let tmp02 = tmp.split('>>');
        if(tmp02.length > 1){
            tmp001 = tmp.split(']');
            tmp = tmp001[tmp001.length -1];
        }
        let tmp03 = tmp.split('->');
        if(tmp03.length > 1){
            tmp = tmp03[tmp03.length -1];
        }
        //---------
        let tmp2 = tmp.split('#');
        if (tmp2.length > 1) {
            property = tmp2[1];
        } else {
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
            tmp2 = property.split(':');
            property = tmp2[tmp2.length - 1];
        }
        //make first letter capital case
        property = property.charAt(0).toUpperCase() + property.slice(1);
        return property;
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
        if(propertyURI.indexOf('[') === -1){
            return false;
        }else{
            return true;
        }
    }
    isFederatedFacet(propertyURI){
        //recognized by []
        let tmp0 = propertyURI.split('>>');
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
    removeLeftBracket(st){
        let tmp = st.split('[');
        if(tmp.length > 1){
            return tmp [1];
        }else{
            return tmp [0];
        }
    }
    removeRightBracket(st){
        let tmp = st.split(']');
        if(tmp.length > 1){
            return tmp [0];
        }else{
            return tmp [0];
        }
    }
    hasSingleGraph(input) {
        if(input.indexOf('->[') === -1){
            return true;
        }else{
            return false;
        }
    }
    parseGraphPath(input) {
        let self = this;
        let out = {service: '', graph: '', property: ''};
        let tmp = input.split(']');
        if(tmp.length > 1){
            if(tmp[1].trim()){
                //has property
                out.property = tmp[1].trim();
            }else{
                //no property-> it is an error after [g]-> should be always a property
            }
            let tmp2 = self.returnServiceGraph(self.removeLeftBracket(tmp[0]));
            out.service = tmp2.service;
            out.graph = tmp2.graph;
        }else{
            out.property = input;
        }
        return out;
    }
    parseMultiGraphAsArray(input){
        let self = this;
        let out = [];
        if(self.hasSingleGraph(input)){
            //console.log(input);
            return input;
        }else{
            let parts = input.split('->[');
            parts.forEach((part, index)=>{
                let children = self.parseMultiGraphAsArray(part.indexOf(']')!== -1 && part.charAt(0)!=='[' ? '['+part : part);
                if(children.length){
                    out.push(children);
                }
            });
        }
        return out;
    }
    prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, tindex, filterSt, withPropAnalysis){
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let self = this;
        let qs = '';
        let graphsSt = self.parseMultiGraphAsArray(propertyURI);
        let graphs = [];
        let pgStart = [];
        let pgEnd = [];
        let psStart = [];
        let psEnd = [];
        let intermediateArr = [];
        if(Array.isArray(graphsSt)){
            graphs = graphsSt;
        }else{
            graphs = [graphsSt];
        }
        //console.log(graphs);
        for (let i = 0; i < graphs.length; i++) {
            pgStart[i] ='';
            pgEnd[i] ='';
            psStart[i] ='';
            psEnd[i] ='';
            intermediateArr[i] = 0;
        }
        /*
        prop1->[g]prop2 go from the value of prop1 to graph g and show the value of prop2
        //need to distinguish between two following cases when property comes from  another graph than origin
        [g]prop or [g]->prop in the begining i.e. re-base to graph g where resource is mentioned and get the value of prop
        [g]prop0->prop2->[g2]prop3 re-base to graph g where property path prop0->prop2 has resource as value and then go to graph g2 and get the prop3: this is useful for intermediate linksets
        */
        let parts ={};
        let counter=0;
        let isIntermediate = 0;
        //start making the nested graphs
        graphs.forEach((graph, index)=>{
            parts = self.parseGraphPath(graph);
            //detect cases where we need to rebase to an intermediate graph property
            let noProp = 0;
            //[g]->
            if(!parts.property){
                //error: should not happen!
                noProp = 1;
                return qs;
            }else{
                let tmp = parts.property.split('->'); //->p
                if(tmp.length > 1){
                    //[g]->empty
                    if(!tmp[0].trim()){
                        //this is the case where re-base to resource is required
                        tmp.shift();
                        parts.property = tmp.join('->');
                    }
                }
            }
            counter++;
            if(index === 0){
                //----parse first graph---
                //console.log(parts);
                if(parts.service){
                    psStart[0] = ` SERVICE <${parts.service}> { `;
                    psEnd[0] = ' }';
                }
                if(parts.graph){
                    //it means rebase  current resources to another graph
                    if(parts.graph !== 'default'){
                        pgStart[0]= ` GRAPH <${parts.graph}> { `;
                        pgEnd[0]= ' }';
                    }
                    let itemp = parts.property.split('||');
                    if(itemp.length > 1){
                        //this is the bridge situation where an intermediate resource with source and target property is given
                        //[g]source||target
                        intermediateArr[0] = 1;
                        //if intermediate is not followed by any graph property, we should make it terminal
                        pgStart[0] = pgStart[0] + `
                        #source property
                        ?osp0 ${self.filterPropertyPath(itemp[0])} ?s .
                        #target property
                        ?osp0 ${self.filterPropertyPath(itemp[1])} ?${(counter === graphs.length) ? (withPropAnalysis ? withPropAnalysis : 'v'+tindex) : 'si0'} .
                        `;
                    }else{
                        //this is normal rebase
                        if(withPropAnalysis){
                            pgStart[0] = pgStart[0] + ` ?s ${self.filterPropertyPath(parts.property)} ?${(counter === graphs.length ? withPropAnalysis : 'vg' + withPropAnalysis + counter)} . `;
                        }else{
                            pgStart[0] = pgStart[0] + ` ?s ${self.filterPropertyPath(parts.property)} ?v${(counter === graphs.length ? tindex : 'g' + tindex + counter)} . `;
                        }
                    }
                }else{
                    if(withPropAnalysis){
                        pgStart[0] = pgStart[0] + ` ?s ${self.filterPropertyPath(parts.property)} ?${(counter === graphs.length ? withPropAnalysis : 'vg' + withPropAnalysis + counter)} . `;
                    }else{
                        pgStart[0] = pgStart[0] + ` ?s ${self.filterPropertyPath(parts.property)} ?v${(counter === graphs.length ? tindex : 'g' + tindex + counter)} . `;
                    }
                    //the types should be written only for the first graph if it is original
                    //todo: remove duplicate instances of the following in query
                    //pgStart[0] =  self.makeExtraTypeFilters(endpointParameters, {type: type}) + pgStart[0];
                }
                if(filterSt && (counter === graphs.length)) {
                    //append filters if required
                    pgEnd[0] = gStart + filterSt + gEnd + pgEnd[0];
                }
                //----end parsing first graph---
            }else{
                //----parse remaining graph---
                if(parts.graph !== 'default'){
                    pgStart[index]= ` GRAPH <${parts.graph}> { `;
                    pgEnd[index]= ' }';
                }
                if(parts.service){
                    psStart[index] = ` SERVICE <${parts.service}> { `;
                    psEnd[index] = ' }';
                    //after service
                    if(filterSt && (counter === graphs.length)) {
                        //append filters if required
                        psStart[index] = gStart + filterSt + psStart[index];
                        psEnd[index] = psEnd[index] + gEnd;
                    }
                }else{
                    //filter in the graph
                    if(filterSt && (counter === graphs.length)) {
                        //append filters if required
                        pgEnd[index] = gStart + filterSt + gEnd + pgEnd[index];
                    }
                }
                //check bridge situations which would come with an intermediate property
                let itempp = parts.property.split('||');
                if(itempp.length > 1){
                    intermediateArr[index] = 1;
                    //we should aslo check if the previous one was intermediate.
                    if(intermediateArr[index-1]){
                        if(withPropAnalysis){
                            pgStart[index] = pgStart[index] + `
                            #source property
                            ?osp${index} ${self.filterPropertyPath(itempp[0])} ?si${index-1} .
                            #target property
                            ?osp${index} ${self.filterPropertyPath(itempp[1])} ?${(counter === graphs.length) ? withPropAnalysis : 'si'+index} .
                            `;
                        }else{
                            pgStart[index] = pgStart[index] + `
                            #source property
                            ?osp${index} ${self.filterPropertyPath(itempp[0])} ?si${index-1} .
                            #target property
                            ?osp${index} ${self.filterPropertyPath(itempp[1])} ?${(counter === graphs.length) ?  'v'+tindex : 'si'+index} .
                            `;
                        }
                    }else{
                        if(withPropAnalysis){
                            pgStart[index] = pgStart[index] + `
                            #source property
                            ?osp${index} ${self.filterPropertyPath(itempp[0])} ?${'vg' + withPropAnalysis + (counter-1)} .
                            #target property
                            ?osp${index} ${self.filterPropertyPath(itempp[1])} ?${(counter === graphs.length) ? withPropAnalysis : 'si'+index} .
                            `;
                        }else{
                            pgStart[index] = pgStart[index] + `
                            #source property
                            ?osp${index} ${self.filterPropertyPath(itempp[0])} ?v${'g' + tindex + (counter-1)} .
                            #target property
                            ?osp${index} ${self.filterPropertyPath(itempp[1])} ?${(counter === graphs.length) ?  'v'+tindex : 'si'+index} .
                            `;
                        }
                    }
                }else{
                    if(withPropAnalysis){
                        if(intermediateArr[index-1]){
                            //this is an exception to enable refering to a resource which is property in another graph
                            pgStart[index] = pgStart[index] + `
                            ?si${index-1} ${self.filterPropertyPath(parts.property)} ?${(counter === graphs.length ? withPropAnalysis : 'vg' + withPropAnalysis + counter)} .
                            `;
                        }else{
                            pgStart[index] = pgStart[index] + `
                            ?vg${withPropAnalysis}${counter-1} ${self.filterPropertyPath(parts.property)} ?${(counter === graphs.length ? withPropAnalysis : 'vg' + withPropAnalysis + counter)} .
                            `;
                        }
                    }else{
                        if(intermediateArr[index-1]){
                            pgStart[index] = pgStart[index] + ` ?si${index-1} ${self.filterPropertyPath(parts.property)} ?v${(counter === graphs.length ? tindex : 'g' + tindex + counter)} . `;
                        }else{
                            pgStart[index] = pgStart[index] + ` ?vg${tindex}${counter-1} ${self.filterPropertyPath(parts.property)} ?v${(counter === graphs.length ? tindex : 'g' + tindex + counter)} . `;
                        }
                    }
                }

            }
        });
        for (let i = 0; i < graphs.length; i++) {
            qs = qs + `${psStart[i]} ${pgStart[i]}`;
        }
        //add anything needed in the middle
        for (let i = graphs.length; i > 0; i--) {
            qs = qs + `${pgEnd[i-1]} ${psEnd[i-1]}`;
        }
        //console.log(qs);
        return qs;
    }
    //gets the total number of items on a facet when a property is selected from master level
    getMasterPropertyValuesCount(endpointParameters, graphName, rconfig, propertyURI) {
        let type = rconfig.type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let queryheart = '';
        //---to support resource focus types
        let st_extra = this.makeExtraTypeFilters(endpointParameters, rconfig);
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', '', '');
        }else{
            let st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.';
            queryheart = st;
        }
        //apply other types of filter on facet
        let facetFilters ='';
        if(rconfig.facetConfigs && rconfig.facetConfigs[propertyURI] && rconfig.facetConfigs[propertyURI].language){
            facetFilters = `
            FILTER(lang(?v)="${rconfig.facetConfigs[propertyURI].language}")
            `;
        }
        queryheart = st_extra + ' ' + queryheart;
        this.query = `
        SELECT (count(DISTINCT ?v) AS ?total) WHERE {
            ${gStart}
                ${queryheart}
                ${facetFilters}
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
        //---to support resource focus types
        let st_extra = this.makeExtraTypeFilters(endpointParameters, rconfig);
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', '', '');
        }else{
            let st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.';
            queryheart = st;
        }
        queryheart = st_extra + ' ' + queryheart;
        //notice: it limits results to first 500 items
        let queryConstraint = `
          ${gStart}
              ${queryheart}
          ${gEnd}
        `;
        //apply other types of filter on facet
        let facetFilters ='';
        if(rconfig.facetConfigs && rconfig.facetConfigs[propertyURI] && rconfig.facetConfigs[propertyURI].language){
            facetFilters = `
            FILTER(lang(?v)="${rconfig.facetConfigs[propertyURI].language}")
            `;
        }
        //need to change the ?s and ?v to a random variable to not overlap with the new pivot
        let rnd = Math.floor(Date.now() / 1000);
        queryConstraint = queryConstraint.replace(/\?s/g, '?pvs'+rnd);
        queryConstraint = queryConstraint.replace(/\?v\./, '?s\.');
        queryConstraint = queryConstraint.replace(/\?v \./, '?s\.');
        queryConstraint = queryConstraint.replace(/\?v/g, '?pv'+rnd);

        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) ?v WHERE {
          ${gStart}
              ${queryheart}
              ${facetFilters}
          ${gEnd}
        } GROUP BY ?v ORDER BY DESC(?total) OFFSET ${page*500} LIMIT 500
        `;
        // console.log(this.prefixes + this.query);
        return {query: this.prefixes + this.query, queryConstraints: queryConstraint};
    }
    getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options) {
        let self = this;
        let type = rconfig.type;
        let st = '', filters, tmp, tmp2, i = 0, hasURIVal = 0, hasLiteralVal = 0, typedLiteralVal = '';
        let typeVal = {};
        filters = [];
        let hasRange = 0;
        let rangeDataType = 'str', rangeDataTypeTail = '';
        for (let key in prevSelection) {
            hasRange = 0;
            rangeDataType = 'str';
            rangeDataTypeTail = ''
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
                });
                //---handle range case
                if(hasLiteralVal && typedLiteralVal !=='str'){
                    rangeDataType = typedLiteralVal;
                    rangeDataTypeTail = '^^'+typedLiteralVal;
                }
                //heterogenous case
                if(hasURIVal && hasLiteralVal){
                    rangeDataType = 'str';
                    rangeDataTypeTail = '';
                }
                if(options.facetConfigs && options.facetConfigs[key] && options.facetConfigs[key].dataType){
                    rangeDataType = '<' + options.facetConfigs[key].dataType + '>';
                    rangeDataTypeTail = '^^' + '<' + options.facetConfigs[key].dataType + '>';
                }
                //add language filters
                if(options.facetConfigs && options.facetConfigs[key] && options.facetConfigs[key].language){
                    filters.push('(lang(?v' + i + ')="'+options.facetConfigs[key].language+'")');
                }
                //-----------
                //apply range filters
                if(tmp.length && options && options.range && options.range[key]){
                    if(options.range[key].min && options.range[key].max){
                        hasRange = 1;
                        //handle both invert and normal range case
                        if(options.invert[key]){
                            filters.push('(' + rangeDataType + '(?v' + i + ') > "'+ options.range[key].max + '"' + rangeDataTypeTail + ') || ' + '(' + rangeDataType + '(?v' + i + ') < "'+ options.range[key].min + '"' + rangeDataTypeTail + ')');
                        }else{
                            filters.push('(' + rangeDataType + '(?v' + i + ') <= "'+ options.range[key].max + '"' + rangeDataTypeTail + ') && ' + '(' + rangeDataType + '(?v' + i + ') >= "'+ options.range[key].min + '"' + rangeDataTypeTail + ')');
                        }
                    }else{
                        if(options.range[key].min){
                            hasRange = 1;
                            if(options.invert[key]){
                                filters.push(rangeDataType + '(?v' + i + ') < "'+ options.range[key].min + '"' + rangeDataTypeTail);
                            }else{
                                filters.push(rangeDataType + '(?v' + i + ') >= "'+ options.range[key].min + '"' + rangeDataTypeTail);
                            }
                        }
                        if(options.range[key].max){
                            hasRange = 1;
                            if(options.invert[key]){
                                filters.push(rangeDataType + '(?v' + i + ') > "'+ options.range[key].max + '"' + rangeDataTypeTail);
                            }else{
                                filters.push(rangeDataType + '(?v' + i + ') <= "'+ options.range[key].max + '"' + rangeDataTypeTail);
                            }
                        }
                    }

                }
                //special case: values are heterogenious, we should convert all to string and use str function then
                if(hasURIVal && hasLiteralVal && !hasRange) {
                    tmp = [];
                    prevSelection[key].forEach(function(el){
                        tmp.push('"' + el.value + '"');
                    });
                    if(endpointParameters.type === 'stardog' || endpointParameters.type === 'sesame'|| endpointParameters.type === 'neptune'){
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
                            filters.push('str(?v' + i + ') NOT IN ('+ tmp.join(',') +')');
                        }else{
                            filters.push('str(?v' + i + ') IN ('+ tmp.join(',') +')');
                        }
                    }
                }else{
                    if(hasURIVal && !hasRange){
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
                        if(!hasRange){
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
                }
                //---------
                if(this.isMultiGraphFacet(key)){
                    //to support browsing mutiple graphs
                    st = st + this.prepareMultiGraphQuery(endpointParameters, graphName, type, key, i, '', '');
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
        let pi = 0;
        if(constraint){
            for(let prop in constraint){
                pi++;
                if(constraint[prop].length>1){
                    let parts1 = ' ?s ' + self.filterPropertyPath(prop) + ' ?cp' + pi +' . ';
                    let parts2 = [];
                    constraint[prop].forEach((el, index)=>{
                        oval = self.addDataTypeToFilter(el);
                        parts2.push('?cp' + pi + '=' + oval);
                    });
                    constraintPhrase = constraintPhrase + parts1 +  ' FILTER( ' + parts2.join(' || ') + ' ) ' ;
                }else{
                    oval = self.addDataTypeToFilter(constraint[prop][0]);
                    constraintPhrase = constraintPhrase + ' ?s ' + self.filterPropertyPath(prop) + ' '+ oval + ' . ' ;
                }
            }
            st_extra = constraintPhrase + st_extra;
        }
        if(rconfig.pivotConstraint){
            st_extra = st_extra + rconfig.pivotConstraint;
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
        let st_extra = this.makeExtraTypeFilters(endpointParameters, rconfig);
        let st = this.getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options);
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', st, '');
        }else{
            st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.' + st;
            queryheart = st;
        }
        queryheart = st_extra + ' ' + queryheart;
        //apply other types of filter on facet
        let facetFilters ='';
        if(options.facetConfigs && options.facetConfigs[propertyURI] && options.facetConfigs[propertyURI].language){
            facetFilters = `
            FILTER(lang(?v)="${options.facetConfigs[propertyURI].language}")
            `;
        }
        let queryConstraint = '';
        if(options.facetConfigs && options.facetConfigs[propertyURI] && options.facetConfigs[propertyURI].pivotDataset){
            if(options.facetConfigs[propertyURI]){
                queryConstraint = `
                  ${gStart}
                      ${queryheart}
                  ${gEnd}
                `;
                //need to change the ?s and ?v to a random variable to not overlap with the new pivot
                let rnd = Math.floor(Date.now() / 1000);
                queryConstraint = queryConstraint.replace(/\?s/g, '?pvs'+rnd);
                queryConstraint = queryConstraint.replace(/\?v\./, '?s\.');
                queryConstraint = queryConstraint.replace(/\?v \./, '?s\.');
                queryConstraint = queryConstraint.replace(/\?v/g, '?pv'+rnd);
            }
        }
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) ?v WHERE {
          ${gStart}
              ${queryheart}
              ${facetFilters}
          ${gEnd}
        } GROUP BY ?v ORDER BY DESC(?total) LIMIT 500
        `;
        return {query: this.prefixes + this.query, queryConstraints: queryConstraint};
    }
    getSideEffectsCount(endpointParameters, graphName, rconfig, propertyURI, prevSelection, options) {
        let queryheart = '';
        let type = rconfig.type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st_extra = this.makeExtraTypeFilters(endpointParameters, rconfig);
        let st = this.getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options);
        //apply other types of filter on facet
        let facetFilters ='';
        if(options.facetConfigs && options.facetConfigs[propertyURI] && options.facetConfigs[propertyURI].language){
            facetFilters = `
            FILTER(lang(?v)="${options.facetConfigs[propertyURI].language}")
            `;
        }
        if(this.isMultiGraphFacet(propertyURI)){
            //to support browsing mutiple graphs
            queryheart = this.prepareMultiGraphQuery(endpointParameters, graphName, type, propertyURI, '', st, '');
        }else{
            st = '?s '+ this.filterPropertyPath(propertyURI) + ' ?v.' + st;
            queryheart = st;
        }
        queryheart = st_extra + ' ' + queryheart;
        this.query = `
        SELECT (count(DISTINCT ?v) AS ?total) WHERE {
            ${gStart}
                ${queryheart}
                ${facetFilters}
            ${gEnd}
        }
        `;
        //console.log(this.query);
        return this.prefixes + this.query;
    }
    //maps unnamed variables used in the query to named variables for analysis
    createMappingForAnalysisProps(prevSelection, options){
        let out = {};
        let self = this;
        let i = 0, aCounter = 0;
        for(let prop in prevSelection){
            i++;
            if(options && options.analysisProps && options.analysisProps[prop]){
                aCounter++;
                out['?v'+i] = '?ldr_ap'+aCounter+'_' + self.getPropertyLabel(prop);
            }
        }
        return Object.keys(out).length ? out : 0;
    }
    createSelectionForAnalysisProps(prevSelection, options){
        let out = {};
        for(let prop in prevSelection){
            if(options && options.analysisProps && options.analysisProps[prop]){
                //check the config
                if(options.facetConfigs && options.facetConfigs[prop] && options.facetConfigs[prop].restrictAnalysisToSelected){
                    out[prop] = prevSelection[prop]
                }
            }
        }
        return Object.keys(out).length ? out : 0;
    }
    handleAnalysisProps(options, endpointParameters, graphName, type){
        let self = this;
        let apLabel = '', analysisSelector = '', analysisPhrase = '', analysisPropsList= [], aCounter = 0;
        let filters =[];
        if(options && options.analysisProps){
            for(let prop in options.analysisProps){
                aCounter++;
                apLabel = 'ldr_ap'+aCounter+'_' + self.getPropertyLabel(prop);
                analysisSelector = analysisSelector + ' ?' + apLabel;
                analysisPropsList.push(apLabel);
                //add language filters
                if(options.facetConfigs && options.facetConfigs[prop] && options.facetConfigs[prop].language){
                    filters.push('(lang(?' + apLabel + ')="'+options.facetConfigs[prop].language+'")');
                }
                if(self.isMultiGraphFacet(prop)){
                    //to support browsing mutiple graphs
                    analysisPhrase = analysisPhrase + self.prepareMultiGraphQuery(endpointParameters, graphName, type, prop, '', '', apLabel);
                }else{
                    analysisPhrase = analysisPhrase + '?s ' + self.filterPropertyPath(prop) + ' ?' + apLabel + ' .';
                }
            }
            if(filters.length){
                analysisPhrase = analysisPhrase + 'FILTER('+filters.join(' && ')+')';
            }
        }
        //todo: OPTIONAL for missing values
        return {analysisPhrase: analysisPhrase, analysisSelector: analysisSelector, analysisPropsList: analysisPropsList};
    }
    countSecondLevelPropertyValues(endpointParameters, graphName, rconfig, prevSelection, options) {
        let type = rconfig.type;
        let {gStart, gEnd} = this.prepareGraphName(graphName);
        let st = this.getMultipleFilters(endpointParameters, graphName, prevSelection, rconfig, options);
        //handle analysis props
        let {analysisPhrase} = this.handleAnalysisProps(options, endpointParameters, graphName, type);
        //---------------------
        this.query = `
        SELECT (count(DISTINCT ?s) AS ?total) WHERE {
            ${gStart}
                ${st}
                ${analysisPhrase}
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
        let languageTag = rtconfig.languageTag;
        let labelProperty = rtconfig.labelProperty;
        let imageProperty = rtconfig.imageProperty;
        let geoProperty = rtconfig.geoProperty;
        let selectStr = '';
        let titleStr = '';
        let imageStr = '';
        let geoStr = '';
        let bindPhase = '';
        let noffset = (offset-1)*limit;
        //handle analysis props
        let {analysisSelector, analysisPhrase, analysisPropsList} = self.handleAnalysisProps(options, endpointParameters, graphName, type);
        //---------------------
        let searchPhase='';
        let searchFiltersSt = '';
        if(searchTerm && searchTerm.length>2){
            //we use a fixed searchTern for show all
            if(searchTerm === 'ldr_showAll'){
                searchPhase = ' ';
            }else{
                searchFiltersSt = 'regex(?title, "'+searchTerm+'", "i") || regex(STR(?s), "'+searchTerm+'", "i")';
                if(analysisPhrase){
                    let tmpAP = [];
                    analysisPropsList.forEach((apItem)=>{
                        tmpAP.push('regex(?'+apItem+', "'+searchTerm+'", "i")');
                    });
                    searchFiltersSt = searchFiltersSt + ' || ' + tmpAP.join(' || ');
                }
                searchPhase = 'FILTER( ' + searchFiltersSt+  ')';
            }
        }
        //add labels for entities
        let langPhrase = '';
        if(languageTag && languageTag.length){
            langPhrase = ` FILTER(lang(?title)="${languageTag[0]}")`;
        }
        if(labelProperty && labelProperty.length){
            selectStr = ' ?title ';
            if(labelProperty.length === 1){
                titleStr = 'OPTIONAL { ?s ' + self.filterPropertyPath(labelProperty[0]) + ' ?title . '+langPhrase+'} ';
            }else {
                titleStr = '';
                let tmpA = [];
                labelProperty.forEach(function(prop, index) {
                    titleStr = titleStr + 'OPTIONAL { ?s ' + self.filterPropertyPath(prop) + ' ?vp'+index+' .} ';
                    tmpA.push('?vp' + index);
                });
                bindPhase = ' BIND(CONCAT('+tmpA.join(',"-",')+') AS ?title) ';
            }
        }else{
            selectStr = ' ?title ';
            titleStr = 'OPTIONAL { ?s rdfs:label ?title . '+langPhrase+'} ';
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
        //virtuoso error when combining BIND with SERVICE: https://github.com/openlink/virtuoso-opensource/issues/244
        if(st.indexOf('SERVICE <') !== -1){
            titleStr = '';
        }
        let limitOffsetPharse =`LIMIT ${limit} OFFSET ${noffset}`;
        if(searchPhase){
            limitOffsetPharse ='';
        }
        //if analysisProps are chosen, we duplicate the filters statement
        let avmapping ={};
        let ast = '';
        let aSelection ={};
        if(analysisPhrase){
            aSelection = this.createSelectionForAnalysisProps(prevSelection, options);
            if(aSelection){
                avmapping = this.createMappingForAnalysisProps(aSelection, options);
                //generates filters only for analysis props
                ast = this.getMultipleFilters(endpointParameters, graphName, aSelection, rtconfig, options);
                for(let prop in avmapping){
                    //need to escape question mark with \\
                    //todo: need to remove duplicats and also variables which are not required
                    ast = ast.replace(new RegExp('\\'+prop, 'g'), avmapping[prop]);
                }
            }
        }

        this.query = `
        SELECT DISTINCT ?s ${selectStr} ${analysisSelector} WHERE {
            ${gStart}
                {
                    SELECT DISTINCT ?s WHERE {
                        ${gStart}
                            ${st}
                            ${analysisPhrase}
                        ${gEnd}
                    }
                    ${limitOffsetPharse}
                }
                ${ast}
                ${analysisPhrase}
                ${titleStr}
                ${imageStr}
                ${geoStr}
                ${searchPhase}
                ${bindPhase}
            ${gEnd}
        }
        `;
        return this.prefixes + this.query;
    }
}
export default FacetQuery;
