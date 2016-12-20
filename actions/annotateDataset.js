import {appFullTitle} from '../configs/general';
import async from 'async';
import getDatasetResourcePropValues from './getDatasetResourcePropValues';
import getAnnotatedResourcesCount from './getAnnotatedResourcesCount';
import annotateText from './annotateText';

let maxPerPage = 1;
export default function annotateDataset(context, payload, done) {
    context.dispatch('LOADING_DATA', {});
    if(payload.params && payload.params.maxPerPage){
        maxPerPage = payload.params.maxPerPage;
    }


}
