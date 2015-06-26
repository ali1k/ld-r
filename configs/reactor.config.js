//important: first value in the array is considered as default value for the property
//this file is visible to the client/server-side
export default {
    //full page title
    appFullTitle: ['Linked Data Reactor'],
    //short page title
    appShortTitle: ['LD-R'],
    //Default Named Graph under observation, if not set , will consider all existing graph names
    defaultGraphName: [''],
    //used for pagination in resource list
    maxNumberOfResourcesOnPage: [100],
    //will prevent access if not logged in
    enableAuthentication: 0,
    //graph that stores users data, must be loaded beforehand
    authGraphName: ['https://ld-r.org/users'],
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
            //resource types to focus on, can be an array, if not set, all existing types will be shown
            resourceFocusType: [''],
            //only allow to view data -> disable edit
            readOnly: 0,
            //if enabled, will categorize properties in different tabs based on propertyCategories
            useCategories: 0,
            categories: [''],
            //config is necessary even if empty config
            config: {

            }
        },
        //for each graph name, you can define custom configs.
        //if no custom config is defined for a specific graph, the generic config will be used.
        'https://ld-r.org/users': {
            readOnly: 0,
            useCategories: 0,
            config: {
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                    isHidden: 1
                },
                'http://xmlns.com/foaf/0.1/accountName': {
                    label: ['Username'],
                    readOnly: 1
                },
                'http://xmlns.com/foaf/0.1/firstName': {
                    label: ['First Name']
                },
                'http://xmlns.com/foaf/0.1/lastName': {
                    label: ['Last Name']
                },
                'http://xmlns.com/foaf/0.1/mbox': {
                    label: ['Email Address'],
                    readOnly: 1
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#password': {
                    label: ['Password'],
                    viewer: ['PasswordView'],
                    editor: ['PasswordInput']
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfGraph': {
                    label: ['Editor of Graph'],
                    allowNewValue: 1
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfResource': {
                    label: ['Editor of Resource'],
                    allowNewValue: 1
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfProperty': {
                    label: ['Editor of Property'],
                    allowNewValue: 1,
                    allowExtension: 1,
                    hasBlankNode: 1,
                    autoLoadDetails: 1,
                    extensions: [
                        {
                            spec: {
                                propertyURI: 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#resource',
                                instances: [{value: 'http://exampleResource.org', valueType: 'uri'}]
                            },
                            config: {
                                hint: ['Resource URI under which the property is exposed.'],
                                label: ['Resource']
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#property',
                                instances: [{value: 'http://exampleProperty.org', valueType: 'uri'}]
                            },
                            config: {
                                hint: ['Property URI'],
                                label: ['Property']
                            }
                        }
                    ]
                },
                'http://xmlns.com/foaf/0.1/organization': {
                    label: ['Organization'],
                    allowNewValue: 1,
                    viewer: ['BasicDBpediaView'],
                    editor: ['DBpediaInput']
                }
            }
        }
    },
    //for Faceted Browser it is required to fill im the following configuration
    facetsConfig: {
        'generic': {
            list: [
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            ],
            config: {

            }
        }
    }
};
