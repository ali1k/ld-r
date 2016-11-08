/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import {BaseStore} from 'fluxible/addons';

class ApplicationStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.pageTitle = '';
        this.loading = 0;
    }
    updatePageTitle(payload) {
        this.pageTitle = payload.pageTitle;
        this.emitChange();
    }
    loaderOn() {
        this.loading = 1;
        this.emitChange();
    }
    loaderOff() {
        this.loading = 0;
        this.emitChange();
    }
    getPageTitle() {
        return this.pageTitle;
    }
    getState() {
        return {
            pageTitle: this.pageTitle,
            loading: this.loading
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.pageTitle = state.pageTitle;
        this.loading = state.loading;
    }
}

ApplicationStore.storeName = 'ApplicationStore'; // PR open in dispatchr to remove this need
ApplicationStore.handlers = {
    'UPDATE_PAGE_TITLE': 'updatePageTitle',
    'LOADING_DATA': 'loaderOn',
    'LOADED_DATA': 'loaderOff'
};

export default ApplicationStore;
