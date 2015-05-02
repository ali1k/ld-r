import loadPage from '../actions/loadPage';

export default {
    home: {
        path: '/',
        method: 'get',
        page: 'home',
        label: 'LD-Reactor',
        title: 'Linked Data Reactor | Home',
        group: 'default_topnav',
        action: loadPage
    },
    about: {
        path: '/about',
        method: 'get',
        page: 'about',
        label: 'About',
        title: 'Linked Data Reactor | About',
        group: 'default_topnav',
        action: loadPage
    }
};
