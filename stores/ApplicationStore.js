import BaseStore from 'fluxible/addons/BaseStore';
import routesConfig from '../configs/routes';

class ApplicationStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.currentPageName = null;
        this.currentPage = null;
        this.currentRoute = null;
        this.pages = routesConfig;
        this.pageTitle = '';
    }
    handlePageTitle(data) {
        this.pageTitle = data.pageTitle;
    }
    handleNavigate(route) {
        if (this.currentRoute && (this.currentRoute.url === route.url)) {
            return;
        }

        const pageName = route.config.page;
        const page = this.pages[pageName];

        this.currentPageName = pageName;
        this.currentPage = page;
        this.currentRoute = route;
        this.emitChange();
    }
    getCurrentPageName() {
        return this.currentPageName;
    }
    getPageTitle() {
        return this.pageTitle;
    }
    getCurrentRoute() {
        return this.currentRoute;
    }
    getPages() {
        return this.pages;
    }
    dehydrate() {
        return {
            currentPageName: this.currentPageName,
            currentPage: this.currentPage,
            pages: this.pages,
            route: this.currentRoute,
            pageTitle: this.pageTitle
        };
    }
    rehydrate(state) {
        this.currentPageName = state.currentPageName;
        this.currentPage = state.currentPage;
        this.pages = state.pages;
        this.currentRoute = state.route;
        this.pageTitle = state.pageTitle;
    }
}

ApplicationStore.storeName = 'ApplicationStore';
ApplicationStore.handlers = {
    'UPDATE_PAGE_TITLE': 'handlePageTitle',
    'CHANGE_ROUTE_SUCCESS': 'handleNavigate'
};

export default ApplicationStore;
