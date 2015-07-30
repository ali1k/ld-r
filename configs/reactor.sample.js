export default {
    //full page title
    appFullTitle: ['Linked Data Reactor'],
    //short page title
    appShortTitle: ['LD-R'],
    //Default Named Graph under observation, if not set , will consider all existing graph names
    defaultGraphName: [''],
    //will prevent access if not logged in
    enableAuthentication: 0,
    //graph that stores users data, must be loaded beforehand
    authGraphName: ['https://github.com/ali1k/ld-reactor/blob/master/plugins/authentication/schema/users.ttl#'],
    //will allow super users to confirm and activate regiastered users
    enableUserConfirmation: 0,
    //will enable email notifications
    enableEmailNotifications: 0,
    //will put all update actions in log folder
    enableLogs: 0,
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
            'https://github.com/ali1k/ld-reactor/blob/master/plugins/authentication/schema/users.ttl#': {
                readOnly: 0
            },
            'http://ld-r.org/datasets/void': {
                resourceFocusType: ['http://rdfs.org/ns/void#Dataset'],
                usePropertyCategories: 1,
                readOnly: 0,
                propertyCategories: ['overview', 'people', 'date', 'legalAspects', 'technicalAspects', 'structuralAspects']
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

            }
        },
        //---------depth 2------------
        dataset_resource: {

        },
        dataset_property: {
            'http://ld-r.org/datasets/void': {
                'http://purl.org/dc/terms/spatial': {
                    label: ['Geographical coverage'],
                    category: ['overview'],
                    hint: ['The geographical area covered by the dataset.The same metadata could also be used to document the geographical area covered by an entity contained in the dataset in particular. For example we could say that the dataset covers all Eu countries or covers only France and Italy.'],
                    allowNewValue: 1,
                    objectReactor: ['AggregateObject'],
                    objectAViewer: ['DBpediaGoogleMapView'],
                    objectIViewer: ['BasicDBpediaView'],
                    asWikipedia: 1,
                    objectAEditor: ['BasicAggregateInput'],
                    objectIEditor: ['DBpediaInput'],
                    lookupClass: ['Place']
                },
                'http://purl.org/dc/terms/creator': {
                    allowNewValue: 1,
                    allowExtension: 1,
                    category: ['people'],
                    label: ['Creator'],
                    hint: ['An entity, such as a person, organisation, or service, that is primarily responsible for creating the dataset. The creator should be described using a URI if available, rather than just providing the name as a literal. ORCID provides a useful service for this.'],
                    objectIEditor: ['DBpediaInput'],
                    objectIViewer: ['BasicDBpediaView'],
                    asWikipedia: 1,
                    extensions: [
                        {
                            spec: {
                                propertyURI: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                                instances: [{value: 'http://xmlns.com/foaf/0.1/Person', valueType: 'uri'}]
                            },
                            config: {
                                hint: ['Type of the entity'],
                                label: ['Type'],
                                category: ['people'],
                                objectIViewer: ['BasicOptionView'],
                                objectIEditor: ['BasicOptionInput'],
                                options: [
                                    {label: 'Person', value: 'http://xmlns.com/foaf/0.1/Person'},
                                    {label: 'Organization', value: 'http://xmlns.com/foaf/0.1/Organization'}
                                ],
                                defaultValue: ['http://xmlns.com/foaf/0.1/Person'],
                                allowUserDefinedValue: 1
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://www.w3.org/2000/01/rdf-schema#label',
                                instances: [{value: 'Label', valueType: 'literal'}]
                            },
                            config: {
                                hint: ['A descriptor label for the URI'],
                                category: ['people'],
                                label: ['Label']
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://xmlns.com/foaf/0.1/mbox',
                                instances: [{value: 'email address', valueType: 'literal'}]
                            },
                            config: {
                                hint: ['A corresponding email address'],
                                category: ['people'],
                                label: ['Email']
                            }
                        }
                    ]
                },
                'http://purl.org/dc/terms/subject': {
                    category: ['overview'],
                    label: ['Keywords'],
                    hint: ['Tags a dataset with a topic. For the general case, we recommend the use of a DBpedia resource URI (http://dbpedia.org/resource/XXX) to categorise a dataset, where XXX stands for the thing which best describes the main topic of what the dataset is about.'],
                    allowNewValue: 1,
                    objectIEditor: ['DBpediaInput'],
                    objectIViewer: ['BasicDBpediaView'],
                    asWikipedia: 1,
                },
                'http://purl.org/dc/terms/temporal': {
                    label: ['Time coverage'],
                    category: ['date'],
                    hint: ['Time coverage of the data itself but not of the data collection. For example we collect pictures in 2015 about the war. However, the pictures themselves could have been taken from 1939 to 1945. So the time coverage is 1939-1945.'],
                    allowExtension: 1,
                    hasBlankNode: 1,
                    autoLoadDetails: 1,
                    extensions: [
                        {
                            spec: {
                                propertyURI: 'http://rdf-vocabulary.ddialliance.org/discovery#startDate',
                                instances: [{value: '2010-12-24', valueType: 'literal'}]
                            },
                            config: {
                                label: ['Start date'],
                                category: ['date'],
                                hint: ['Start date of the time coverage.']
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://rdf-vocabulary.ddialliance.org/discovery#endDate',
                                instances: [{value: '2015-12-24', valueType: 'literal'}]
                            },
                            config: {
                                label: ['End date'],
                                category: ['date'],
                                hint: ['End date of the time coverage.']
                            }
                        }
                    ]
                },
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                    //it will not affect the sub properties in detail
                    isHidden: 1,
                    category: ['overview'],
                    label: ['Type'],
                    hint: ['Type of the entity.']
                },
                'http://purl.org/dc/terms/title': {
                    label: ['Title'],
                    category: ['overview'],
                    hint: ['The title of the dataset described by this document.'],
                    objectReactorType: ['IndividualObjectReactor'],
                    dataViewType: ['IndividualDataView'],
                    objectIViewer: ['BasicIndividualView'],
                    objectIEditor: ['BasicIndividualInput']
                },
                'http://purl.org/dc/terms/description': {
                    category: ['overview'],
                    label: ['Textual description'],
                    hint: ['A textual description of the dataset.'],
                    objectIEditor: ['BasicTextareaInput']
                },
                'http://purl.org/dc/terms/language': {
                    allowNewValue: 1,
                    label: ['Dataset Language'],
                    category: ['overview'],
                    hint: ['The language of the dataset. Resources defined by the Library of Congress (http://id.loc.gov/vocabulary/iso639-1.html, http://id.loc.gov/vocabulary/iso639-2.html) SHOULD be used.'],
                    objectIViewer: ['LanguageView'],
                    objectIEditor: ['LanguageInput'],
                    defaultValue: ['http://id.loc.gov/vocabulary/iso639-1/en']
                },
                'http://purl.org/dc/terms/license': {
                    category: ['legalAspects'],
                    label: ['License'],
                    hint: ['Data without explicit license is a potential legal liability and leaves consumers unclear what the usage conditions are. Therefore, it is very important that publishers make explicit the terms under which the dataset can be used.'],
                    allowNewValue: 1,
                    objectIViewer: ['BasicOptionView'],
                    objectIEditor: ['BasicOptionInput'],
                    options: [
                        {label: 'Open Data Commons Public Domain Dedication and License (PDDL)', value: 'http://www.opendatacommons.org/licenses/pddl/'},
                        {label: 'Open Data Commons Attribution License', value: 'http://www.opendatacommons.org/licenses/by/'},
                        {label: 'Open Data Commons Open Database License (ODbL)', value: 'http://www.opendatacommons.org/licenses/odbl/'},
                        {label: 'Creative Commons Public Domain Dedication', value: 'http://creativecommons.org/publicdomain/zero/1.0/'},
                        {label: 'Creative Commons Attribution-ShareAlike', value: 'http://creativecommons.org/licenses/by-sa/3.0/'},
                        {label: 'GNU Free Documentation License', value: 'http://www.gnu.org/copyleft/fdl.html'}
                    ],
                    defaultValue: ['http://creativecommons.org/licenses/by-sa/3.0/'],
                    allowUserDefinedValue: 1
                },
                'http://rdf.risis.eu/metadata/table': {
                    category: ['structuralAspects'],
                    label: ['Tables'],
                    hint: ['The specification of tables in your dataset.'],
                    allowNewValue: 1,
                    allowExtension: 1,
                    hasBlankNode: 1,
                    extensions: [
                        {
                            spec: {
                                propertyURI: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                                instances: [{value: 'http://rdf.risis.eu/metadata/Table', valueType: 'uri'}]
                            },
                            config: {
                                label: ['Type'],
                                category: ['structuralAspects'],
                                objectIViewer: ['BasicOptionView'],
                                objectIEditor: ['BasicOptionInput'],
                                options: [
                                    {label: 'Table', value: 'http://rdf.risis.eu/metadata/Table'},
                                ],
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://xmlns.com/foaf/0.1/name',
                                instances: [{value: '', valueType: 'literal'}]
                            },
                            config: {
                                label: ['Table Name'],
                                category: ['structuralAspects'],
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://purl.org/dc/terms/description',
                                instances: [{value: '', valueType: 'literal'}]
                            },
                            config: {
                                label: ['Description'],
                                objectIEditor: ['BasicTextareaInput'],
                                category: ['structuralAspects']
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://rdf.risis.eu/metadata/records',
                                instances: [{value: '', valueType: 'literal'}]
                            },
                            config: {
                                label: ['Total Number of Records'],
                                category: ['structuralAspects'],
                                placeholder: ['Enter the total number of records...']
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://rdf.risis.eu/metadata/attributes',
                                instances: [{value: '', valueType: 'literal'}]
                            },
                            config: {
                                label: ['Total Number of Attributes'],
                                category: ['structuralAspects'],
                                placeholder: ['Enter the total number of attributes...']
                            }
                        },
                        {
                            spec: {
                                propertyURI: 'http://rdf.risis.eu/metadata/attribute',
                                instances: [{value: '', valueType: 'literal'}]
                            },
                            config: {
                                label: ['Attributes'],
                                category: ['structuralAspects'],
                                placeholder: ['Enter the attribute name...'],
                                allowNewValue: 1
                            }
                        }
                    ]
                }
            },
            'https://github.com/ali1k/ld-reactor/blob/master/plugins/authentication/schema/users.ttl#': {
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
