export default {
    // config = scope + spec
    // scope is one the 15 combination of dataset, resource, property and object
    config: {
        //---------depth 1------------
        dataset: {
            'generic': {
                resourceFocusType: [],
                //only allow to view data -> disable edit
                readOnly: 1,
                //used for pagination in resource list
                maxNumberOfResourcesOnPage: 20,
                datasetReactor: ['Dataset']
            },
            'http://ld-r.org/users': {
                readOnly: 0
            }
        },
        resource: {
            'generic': {
                //if enabled, will categorize properties in different tabs based on property categories
                usePropertyCategories: 0,
                propertyCategories: [],
                //used when creating random resources
                dynamicResourceDomain: ['http://example.org'],
                resourceReactor: ['Resource']
            }
        },
        property: {
            'generic': {
                propertyReactor: ['IndividualProperty'],
                //following are object-based scope:
                objectReactor: ['IndividualObject'],
                //to view/edit individual object values
                objectIViewer: ['BasicIndividualView'],
                objectIEditor: ['BasicIndividualInput'],
                extendedOEditor: ['BasicIndividualDetailEdit'],
                extendedOViewer: ['BasicIndividualDetailView'],
                shortenURI: 1
            }
        },
        //property value = object
        object: {
            'generic': {
                truncateURI: 1
            }
        },
        //---------depth 2------------
        dataset_resource: {

        },
        dataset_property: {
            'http://ld-r.org/users': {
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
                    objectIViewer: ['PasswordView'],
                    objectIEditor: ['PasswordInput']
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
                    objectIViewer: ['BasicDBpediaView'],
                    objectIEditor: ['DBpediaInput']
                }
            }
        },
        dataset_object: {

        },
        resource_property: {

        },
        resource_object: {

        },
        property_object: {

        },
        //---------depth 3------------
        dataset_resource_property: {

        },
        dataset_resource_object: {

        },
        dataset_property_object: {

        },
        resource_property_object: {

        },
        //---------depth 4------------
        dataset_resource_property_object: {

        }
    }
};
