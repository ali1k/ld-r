//important: first value in the array is considered as default value for the property
//this file is visible to the client/server-side
export default {
    //Default Named Graph under observation, if not set , will consider all existing graph names
    defaultGraphName: [''],
    //resource types to start with, can be an array, if not set, all existing types will be shown
    resourceFocusType: [''],
    //used for pagination in resource list
    maxNumberOfResourcesOnPage: [100],
    //only allow to view data -> disable edit
    readOnly: 0,
    //will withdraw access if not logged in
    enableAuthentication: 0,
    //graph that stores users data, must be loaded beforehand
    authGraphName: ['https://github.com/ali1k/ld-reactor/blob/master/plugins/authentication/schema/users.ttl#'],
    //used when creating random resources
    dynamicResourceDomain: ['http://example.org'],
    //will allow super users to confirm and activate regiastered users
    enableUserConfirmation: 0,
    //will enable email notifications
    enableEmailNotifications: 0,
    //will put all update actions in log folder
    enableLogs: 0,
    //[Optional] config for property components
    propertiesConfig: {
        //these configs are used as generic configs, which still can be empty!
        'generic': {
            //if enabled, will categorize properties in different tabs based on propertyCategories
            useCategories: 0,
            categories: [''],
            //config is necessary even if empty config
            config: {

            }
        },
        //for each graph name, you can define custom configs.
        //if no custom config is defined for a specific graph, the generic config will be used.
        'https://github.com/ali1k/ld-reactor/blob/master/plugins/authentication/schema/users.ttl#': {
            useCategories: 0,
            config: {

            }
        }
    }
};
