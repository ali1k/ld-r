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
            //authentication graph
            'http://ld-r.org/users': {
                readOnly: 0,
                resourceFocusType: ['https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#User'],
                resourceLabelProperty: ['http://xmlns.com/foaf/0.1/accountName']
            },
            'http://ld-r.org/configurations': {
                readOnly: 0,
                resourceFocusType: ['https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#ReactorConfig', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#ServerConfig', 'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#FacetsConfig'],
                datasetLabel: ['LD-R Configurations'],
                resourceLabelProperty: ['http://www.w3.org/2000/01/rdf-schema#label']
            },
            //example reactor config
            'http://live.dbpedia.org/sparql': {
                readOnly: 1,
                resourceFocusType: ['http://dbpedia.org/ontology/University'],
                datasetLabel: ['DBpedia Universities']
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
        //---------depth 2------------
        dataset_resource: {

        },
        dataset_property: {
            //for configuration manager
            'http://ld-r.org/configurations': {
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                    isHidden: 1
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#scope': {
                    hint: ['Determines the type of scope in LD-R'],
                    objectIEditor: ['BasicOptionInput'],
                    objectIViewer: ['BasicOptionView'],
                    options: [
                        {label: 'Dataset', value: 'D'},
                        {label: 'Resource', value: 'R'},
                        {label: 'Property', value: 'P'},
                        {label: 'Dataset-Resource', value: 'DR'},
                        {label: 'Dataset-Property', value: 'DP'},
                        {label: 'Resource-Property', value: 'RP'},
                        {label: 'Dataset-Resource-Property', value: 'DRP'},
                    ]
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#dataset': {
                    shortenURI: 0
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#property': {
                    shortenURI: 0,
                    objectIViewer: ['PrefixBasedView'],
                    objectIEditor: ['PrefixBasedInput']
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#resource': {
                    shortenURI: 0,
                    objectIViewer: ['PrefixBasedView'],
                    objectIEditor: ['PrefixBasedInput']
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#config': {
                    label: ['Configuration']
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#list': {
                    shortenURI: 0,
                    objectIViewer: ['PrefixBasedView'],
                    objectIEditor: ['PrefixBasedInput']
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#treatAsResourceType': {
                    label: ['Treat as Resource Type'],
                    hint: ['If set to true, will consider resource URI as type URI for resource'],
                    objectIViewer:['ToggleView'],
                    objectIEditor:['ToggleEdit'],
                    onValue: ['1'],
                    offValue: ['0']
                },
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#useReasoning': {
                    label: ['Use Reasoning?'],
                    objectIViewer:['ToggleView'],
                    objectIEditor:['ToggleEdit'],
                    onValue: ['1'],
                    offValue: ['0']
                }
            },
            //for user page
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
                'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#editorOfDataset': {
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
        resource_property: {

        },
        //---------depth 3------------
        dataset_resource_property: {

        }
    }
};
