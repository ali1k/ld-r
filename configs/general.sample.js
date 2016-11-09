export default {
    //full page title
    appFullTitle: ['Linked Data Reactor'],
    //short page title
    appShortTitle: ['LD-R'],

    //Default Dataset under observation, if not set , will consider all existing graph names
    defaultDatasetURI: [''],

    //will prevent access if not logged in
    enableAuthentication: 0,
    //graph that stores users data, must be loaded beforehand
    authDatasetURI: ['http://ld-r.org/users'],
    //will allow super users to confirm and activate regiastered users
    enableUserConfirmation: 0,
    //if enabled will allow a recaptcha box in the registration form
    //note: if it is enabled, you need to set the key parameteres for recaptcha in the  server.js file
    useGoogleRecaptcha: 0,

    //the domain name under which basic dynamic resources and user resources will be defined
    baseResourceDomain: ['http://ld-r.org'],

    //will enable email notifications
    enableEmailNotifications: 0,

    //will put all update actions in log folder
    enableLogs: 0,

    //if provided will track the users on your LD-R instance
    googleAnalyticsID: '',

    //if set, will use the configs stored in a triple store
    enableDynamicServerConfiguration: 0,
    enableDynamicReactorConfiguration: 0,
    enableDynamicFacetsConfiguration: 0,
    //graph that stores your configurations
    configDatasetURI: ['http://ld-r.org/configurations'],
    //will enable/disable auto config
    enableAutomaticConfiguration: 0
};
