import {appFullTitle} from '../configs/general';
import async from 'async';
import getDatasetResourcePropValues from './getDatasetResourcePropValues';
import countAnnotatedResourcesWithProp from './countAnnotatedResourcesWithProp';
import countTotalResourcesWithProp from './countTotalResourcesWithProp';
import annotateText from './annotateText';
import createResourceAnnotation from './createResourceAnnotation';

let maxPerPage = 10;
export default function annotateDataset(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
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
            totalToBeAnnotated = parseInt(res0.total) - parseInt(res1.annotated);
            totalPages = Math.ceil(totalToBeAnnotated / maxPerPage);
            //console.log(res1.annotated,res0.total, totalPages);
            //stop if all are annotated
            if(!totalPages){
                context.dispatch('LOADED_DATA', {});
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
                                query: resource.ov
                            }, (err3, res3)=>{
                                //console.log('annotateText', resource.ov, res3);
                                context.executeAction(createResourceAnnotation, {
                                    //it can store annotations in a different dataset if set
                                    dataset: payload.storingDataset ? payload.storingDataset : res2.datasetURI,
                                    resource: resource.r,
                                    property: res2.propertyURI,
                                    annotations: res3.tags,
                                }, (err4, res4)=>{
                                    //console.log('createResourceAnnotation', res4, resource.r, progressCounter+1);
                                    //annotation is added
                                    progressCounter++;
                                    acallback(resource.r); //callback
                                });
                            });
                        });
                    });
                    //run tasks async: todo: increase parallel requests to dbpedia sptlight
                    async.parallel(asyncTasks [page], (res5)=>{
                        //console.log('parallel', page, progressCounter,totalToBeAnnotated, res5);
                        if(progressCounter === totalToBeAnnotated-1){
                            //end of annotation for this loop
                            context.dispatch('LOADED_DATA', {});
                            done();
                        }

                    });
                });
            }
        });
    });
}
