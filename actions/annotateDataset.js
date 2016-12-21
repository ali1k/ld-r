import {appFullTitle} from '../configs/general';
import async from 'async';
import getDatasetResourcePropValues from './getDatasetResourcePropValues';
import getAnnotatedResourcesCount from './getAnnotatedResourcesCount';
import annotateText from './annotateText';
import createResourceAnnotation from './createResourceAnnotation';

let maxPerPage = 1;
export default function annotateDataset(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    if(payload.params && payload.params.maxPerPage){
        maxPerPage = payload.params.maxPerPage;
    }
    //get the number of annotated/all resource
    let totalPages = 0;
    let asyncTasks = [];
    context.executeAction(getAnnotatedResourcesCount, payload, (res1)=>{
        totalPages = Math.ceil((parseInt(res1.total) - parseInt(res1.annotated)) / maxPerPage);
        //stop if all are annotated
        if(!totalPages){
            context.dispatch('LOADED_DATA', {});
            done();
            return 0;
        }
        //get all the resource/text values to annotate
        for (let page = 0; page <= totalPages; page++) {
            asyncTasks = [];
            context.executeAction(getDatasetResourcePropValues, {
                id: payload.id,
                resourceType: payload.resourceType,
                propertyURI: payload.propertyURI,
                maxOnPage: maxPerPage,
                page: page
            }, (res2)=>{
                res2.resources.forEach((resource)=>{
                    asyncTasks.push((acallback)=>{
                        context.executeAction(annotateText, {
                            query: resource.ov
                        }, (res4)=>{
                            context.executeAction(createResourceAnnotation, {
                                dataset: res2.datasetURI,
                                resource: resource.r,
                                property: res2.propertyURI,
                                annotations: res4.tags,
                            }, (res5)=>{
                                //annotation is added
                                acallback(); //callback
                            });
                        });
                    });
                });
                //run tasks async
                async.parallelLimit(asyncTasks, 20, (res5)=>{
                    if(page === totalPages){
                        //end of annotation for this loop
                        context.dispatch('LOADED_DATA', {});
                        done();
                    }

                });
            });
        }
    });
}
