import {appFullTitle} from '../configs/general';
import async from 'async';
import getDatasetResourcePropValues from './getDatasetResourcePropValues';
import countAnnotatedResourcesWithProp from './countAnnotatedResourcesWithProp';
import countTotalResourcesWithProp from './countTotalResourcesWithProp';
import annotateText from './annotateText';
import createResourceAnnotation from './createResourceAnnotation';
import createNewReactorConfig from './createNewReactorConfig';

let maxPerPage = 10;
export default function annotateDataset(context, payload, done) {
    if(payload.maxPerPage){
        maxPerPage = payload.maxPerPage;
    }
    //get the number of annotated/all resource
    let totalPages = 0;
    let asyncTasks = {};
    let totalToBeAnnotated = 0;
    let progressCounter = 0;
    context.executeAction(countTotalResourcesWithProp, payload, (err0, res0)=>{
        context.executeAction(countAnnotatedResourcesWithProp, payload, (err1, res1)=>{
            if(payload.storingDataset){
                //create a new config if set
                context.executeAction(createNewReactorConfig, {
                    dataset: payload.storingDataset,
                    scope: 'D',
                    options: {
                        resourceFocusType: 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#AnnotatedResource',
                        datasetLabel: 'Annotated ' + payload.id
                    }
                }, (err11, res11)=>{
                });
            }
            totalToBeAnnotated = parseInt(res0.total) - parseInt(res1.annotated);
            totalPages = Math.ceil(totalToBeAnnotated / maxPerPage);
            //console.log(res1.annotated,res0.total, totalPages);
            //stop if all are annotated
            if(!totalPages){
                done();
                return 0;
            }
            //get all the resource/text values to annotate
            for (let page = 1; page <= totalPages; page++) {
                context.executeAction(getDatasetResourcePropValues, {
                    id: payload.id,
                    resourceType: payload.resourceType,
                    propertyURI: payload.propertyURI,
                    maxOnPage: maxPerPage,
                    page: page
                }, (err2, res2)=>{
                    //console.log('getDatasetResourcePropValues', page, res2);
                    asyncTasks [page] = [];
                    res2.resources.forEach((resource)=>{
                        asyncTasks [page].push((acallback)=>{
                            context.executeAction(annotateText, {
                                query: resource.ov,
                                id: resource.r
                            }, (err3, res3)=>{
                                //console.log('annotateText', resource.ov, res3);
                                //annotation progress
                                progressCounter++;
                                context.executeAction(createResourceAnnotation, {
                                    //it can store annotations in a different dataset if set
                                    dataset: payload.storingDataset ? payload.storingDataset : res2.datasetURI,
                                    resource: res3.id,
                                    property: res2.propertyURI,
                                    annotations: res3.tags,
                                    inNewDataset: payload.storingDataset ? 1 : 0
                                }, (err4, res4)=>{
                                    //console.log('createResourceAnnotation', res4, resource.ov, progressCounter+1);
                                    acallback(resource.r); //callback
                                });
                            });
                        });
                    });
                    //run tasks async: todo: increase parallel requests to dbpedia sptlight
                    async.parallel(asyncTasks [page], (res5)=>{
                        //console.log('parallel' + page, progressCounter, totalToBeAnnotated);
                        if(progressCounter === totalToBeAnnotated){
                            //end of annotation for this loop
                            done();
                        }

                    });
                });
            }
        });
    });
}
