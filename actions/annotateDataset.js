import {appFullTitle} from '../configs/general';
import async from 'async';
import getDatasetResourcePropValues from './getDatasetResourcePropValues';
import countAnnotatedResourcesWithProp from './countAnnotatedResourcesWithProp';
import countTotalResourcesWithProp from './countTotalResourcesWithProp';
import annotateText from './annotateText';
import createResourceAnnotation from './createResourceAnnotation';
import createNewReactorConfig from './createNewReactorConfig';
import createASampleFacetsConfig from './createASampleFacetsConfig';
//let startTime, elapsedTime;
let processData = (page, maxPerPage, totalPages, payload, done)=> {
    //console.log('processing', page, maxPerPage, totalPages, payload);
    context.executeAction(getDatasetResourcePropValues, {
        id: payload.id,
        resourceType: payload.resourceType,
        propertyURI: payload.propertyURI,
        maxOnPage: maxPerPage,
        page: page,
        inNewDataset: payload.storingDataset ? payload.storingDataset : 0
    }, (err2, res2)=>{
        //console.log('getDatasetResourcePropValues', page, res2);
        asyncAnnotationTasks [page] = [];
        asyncEnrichmentTasks [page] = [];
        if(res2 && res2.resources && res2.resources.length){
            res2.resources.forEach((resource)=>{
                asyncAnnotationTasks [page].push((acallback)=>{
                    //annotation progress
                    progressCounter++;
                    //startTime = Date.now();
                    context.executeAction(annotateText, {
                        query: resource.ov,
                        id: resource.r,
                        confidence: payload.confidence,
                        language: payload.language,
                        stopWords: payload.stopWords,
                        hideFeedback: payload.hideFeedback
                    }, (err3, res3)=>{
                        //elapsedTime = Date.now() - startTime;
                        //console.log('got annotation for '+ res3.id+' in ' + elapsedTime);
                        //console.log('annotateText', resource.ov, res3);
                        //create a queue for enrichment
                        asyncEnrichmentTasks [page].push((ecallback)=>{
                            if(res3 && res3.id && !res3.error){
                                //startTime = Date.now();
                                context.executeAction(createResourceAnnotation, {
                                    //it can store annotations in a different dataset if set
                                    dataset: payload.storingDataset ? payload.storingDataset : res2.datasetURI,
                                    resource: res3.id,
                                    property: res2.propertyURI,
                                    annotations: res3.tags,
                                    inNewDataset: payload.storingDataset ? payload.storingDataset : 0
                                }, (err4, res4)=>{
                                    //elapsedTime = Date.now() - startTime;
                                    //console.log('wrote annotation for '+ res3.id+' in ' + elapsedTime);
                                    //console.log('createResourceAnnotation', res4, resource.ov, progressCounter+1);
                                    ecallback(null, null);
                                });
                            }else{
                                ecallback(null, null);
                            }
                        });
                        acallback(null, resource.r); //callback
                    });
                });
            });
        }
        if(asyncAnnotationTasks [page].length){
            //run tasks async: todo: increase parallel requests to dbpedia sptlight?
            //async.series(asyncAnnotationTasks [page], (err5, res5)=>{
            async.parallel(asyncAnnotationTasks [page], (err5, res5)=>{
                //console.log(asyncEnrichmentTasks);
                async.series(asyncEnrichmentTasks [page], (err6, res6)=>{
                //async.parallel(asyncEnrichmentTasks [page], (err6, res6)=>{
                    //console.log('parallel' + page, progressCounter, totalToBeAnnotated);
                    if(progressCounter === totalToBeAnnotated){
                        //end of annotation for this loop
                        done();
                    }
                    //console.log('next loop?', page , totalPages);
                    if(page < totalPages){
                        processData(page+1, maxPerPage, totalPages, payload, done);
                    }
                });
            });
        }else{
            if(progressCounter === totalToBeAnnotated){
                //end of annotation for this loop
                done();
            }
            //console.log('next loop?', page , totalPages);
            if(page < totalPages){
                processData(page+1, maxPerPage, totalPages, payload, done);
            }
        }
    });
}
let totalPages = 0;
let asyncAnnotationTasks = {};
let asyncEnrichmentTasks = {};
let totalToBeAnnotated = 0;
let progressCounter = 0;
let maxPerPage = 10;
export default function annotateDataset(context, payload, done) {
    if(payload.maxPerPage){
        maxPerPage = payload.maxPerPage;
    }
    if(payload.batchSize){
        maxPerPage = payload.batchSize;
    }
    //get the number of annotated/all resource
    context.executeAction(countTotalResourcesWithProp, payload, (err0, res0)=>{
        context.executeAction(countAnnotatedResourcesWithProp, {
            id: payload.storingDataset ? payload.storingDataset : payload.id,
            resourceType: payload.resourceType,
            propertyURI: payload.propertyURI,
            inNewDataset: payload.storingDataset ? payload.storingDataset : 0
        }, (err1, res1)=>{
            if(payload.storingDataset && !parseInt(payload.noDynamicConfig)){
                //create a new reactor config if set
                context.executeAction(createNewReactorConfig, {
                    dataset: payload.storingDataset,
                    scope: 'D',
                    options: {
                        resourceFocusType: 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#AnnotatedResource',
                        datasetLabel: '[Annotated] ' + payload.datasetLabel
                    }
                }, (err11, res11)=>{
                });
                //create a new facets config if set
                context.executeAction(createASampleFacetsConfig, {
                    dataset: payload.storingDataset,
                    options: {
                        annotationFacets: 1,
                        datasetLabel: '[Annotated] ' + payload.datasetLabel
                    }
                }, (err12, res12)=>{
                });
            }
            totalToBeAnnotated = parseInt(res0 && res0.total ? res0.total : 0) - parseInt(res1 && res1.annotated ? res1.annotated : 0);
            totalPages = Math.ceil(totalToBeAnnotated / maxPerPage);
            //console.log(res1.annotated, res0.total, totalPages);
            //stop if all are annotated
            if(!totalPages){
                done();
                return 0;
            }
            progressCounter = 0;
            processData(1, maxPerPage, totalPages, payload, done);
        });
    });
}
