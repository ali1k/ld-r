//important: first value in the array is considered as default value for the property
//this file is visible to the client/server-side
export default {
    //full page title
    appFullTitle: ['Linked Data Reactor'],
    //short page title
    appShortTitle: ['LD-Reactor'],
    //Default Named Graph under observation, if not set , will consider all existing graph names
    defaultGraphName: [''],
    //used for pagination in resource list
    maxNumberOfResourcesOnPage: [50],
    //will prevent access if not logged in
    enableAuthentication: 1,
    //graph that stores users data, must be loaded beforehand
    authGraphName: ['http://ld-r.org/users'],
    //used when creating random resources
    dynamicResourceDomain: ['http://ld-r.org'],
    //will allow super users to confirm and activate regiastered users
    enableUserConfirmation: 1,
    //will enable email notifications
    enableEmailNotifications: 1,
    //will put all update actions in log folder
    enableLogs: 1,
    //[Optional] config for property components
    propertiesConfig: {
        //these configs are used as generic configs, which still can be empty!
        'generic': {
            //resource types to focus on, can be an array, if not set, all existing types will be shown
            resourceFocusType: ['http://rdfs.org/ns/void#Dataset'],
            //only allow to view data -> disable edit
            readOnly: 0,
            //if enabled, will categorize properties in different tabs based on propertyCategories
            useCategories: 0,
            categories: [''],
            //config is necessary even if empty config
            config: {

            }
        },
        'http://risis.org': {
            //if enabled, will categorize properties in different tabs based on propertyCategories
            readOnly: 0,
            useCategories: 1,
            categories: ['overview', 'people', 'date', 'legalAspects', 'technicalAspects'],
            //config is necessary even if empty config
            config: {
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
                    viewer: ['BasicIndividualView'],
                    dataEditType: ['IndividualDataEdit'],
                    editor: ['BasicIndividualInput']
                },
                'http://purl.org/dc/terms/language': {
                    allowNewValue: 1,
                    label: ['Dataset Language'],
                    category: ['overview'],
                    hint: ['The language of the dataset. Resources defined by the Library of Congress (http://id.loc.gov/vocabulary/iso639-1.html, http://id.loc.gov/vocabulary/iso639-2.html) SHOULD be used.'],
                    viewer: ['LanguageView'],
                    editor: ['LanguageInput'],
                    defaultValue: ['http://id.loc.gov/vocabulary/iso639-1/en']
                },
                'http://purl.org/dc/terms/temporal': {
                    label: ['Time coverage'],
                    category: ['date'],
                    hint: ['Time coverage of the data itself but not of the data collection. For example we collect pictures in 2015 about the war. However, the pictures themselves could have been taken from 1939 to 1945. So the time coverage is 1939-1945.'],
                    allowExtension: 1,
                    hasBlankNode: 1,
                    extensions: {
                        config: {
                            'http://rdf-vocabulary.ddialliance.org/discovery#startDate': {
                                label: ['Start date'],
                                category: ['overview'],
                                hint: ['Start date of the time coverage.']
                            },
                            'http://rdf-vocabulary.ddialliance.org/discovery#endDate': {
                                label: ['End date'],
                                category: ['overview'],
                                hint: ['End date of the time coverage.']
                            }
                        }
                    }
                },
                'http://purl.org/dc/terms/spatial': {
                    label: ['Geographical coverage'],
                    category: ['overview'],
                    hint: ['The geographical area covered by the dataset.The same metadata could also be used to document the geographical area covered by an entity contained in the dataset in particular. For example we could say that the dataset covers all Eu countries or covers only France and Italy.'],
                    allowNewValue: 1,
                    objectReactorType: ['AggregateObjectReactor'],
                    dataViewType: ['AggregateDataView'],
                    viewer: ['DBpediaGoogleMapView'],
                    viewerI: ['BasicDBpediaView'],
                    editor: ['DBpediaInput'],
                    lookupClass: ['Place']
                },
                'http://purl.org/dc/terms/description': {
                    category: ['overview'],
                    label: ['Textual description'],
                    hint: ['A textual description of the dataset.'],
                    editor: ['BasicTextareaInput']
                },
                'http://purl.org/dc/terms/subject': {
                    category: ['overview'],
                    label: ['Keywords'],
                    hint: ['Tags a dataset with a topic. For the general case, we recommend the use of a DBpedia resource URI (http://dbpedia.org/resource/XXX) to categorise a dataset, where XXX stands for the thing which best describes the main topic of what the dataset is about.'],
                    allowNewValue: 1,
                    editor: ['DBpediaInput'],
                    viewer: ['BasicDBpediaView']
                },
                'http://purl.org/dc/terms/source': {
                    label: ['Data Source'],
                    allowNewValue: 1,
                    category: ['overview'],
                    hint: ['A related resource from which the dataset is derived. The source should be described using a URI if available, rather than as a literal.']
                },
                'http://purl.org/dc/terms/creator': {
                    allowNewValue: 1,
                    allowExtension: 1,
                    category: ['people'],
                    label: ['Creator'],
                    hint: ['An entity, such as a person, organisation, or service, that is primarily responsible for creating the dataset. The creator should be described using a URI if available, rather than just providing the name as a literal. ORCID provides a useful service for this.'],
                    editor: ['DBpediaInput'],
                    viewer: ['BasicDBpediaView'],
                    extendedViewer: ['BasicIndividualDetailView'],
                    extensions: {
                        config: {
                            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                                valueType: 'uri',
                                hint: ['Type of the entity'],
                                label: ['Type'],
                                viewer: ['BasicOptionView'],
                                editor: ['BasicOptionInput'],
                                options: [
                                    {label: 'Person', value: 'http://xmlns.com/foaf/0.1/Person'},
                                    {label: 'Organization', value: 'http://xmlns.com/foaf/0.1/Organization'}
                                ],
                                value: ['http://xmlns.com/foaf/0.1/Person'],
                                defaultValue: ['http://xmlns.com/foaf/0.1/Person'],
                                allowUserDefinedValue: 1
                            },
                            'http://www.w3.org/2000/01/rdf-schema#label': {
                                value: 'Label',
                                valueType: 'literal',
                                hint: ['A descriptor label for the URI'],
                                label: ['Label']
                            },
                            'http://xmlns.com/foaf/0.1/mbox': {
                                value: 'email address',
                                valueType: 'literal',
                                hint: ['A corresponding email address'],
                                label: ['Email']
                            }
                        }
                    }
                },
                'http://purl.org/dc/terms/publisher': {
                    allowNewValue: 1,
                    allowExtension: 1,
                    category: ['people'],
                    label: ['Publisher'],
                    hint: ['An entity, such as a person, organisation, or service, that is responsible for making the dataset available. The publisher should be described using a URI if available, rather than just providing the name as a literal.'],
                    editor: ['DBpediaInput'],
                    viewer: ['BasicDBpediaView'],
                    extendedViewer: ['BasicIndividualDetailView'],
                    extensions: {
                        config: {
                            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                                valueType: 'uri',
                                hint: ['Type of the entity'],
                                label: ['Type'],
                                viewer: ['BasicOptionView'],
                                editor: ['BasicOptionInput'],
                                options: [
                                    {label: 'Person', value: 'http://xmlns.com/foaf/0.1/Person'},
                                    {label: 'Organization', value: 'http://xmlns.com/foaf/0.1/Organization'}
                                ],
                                value: ['http://xmlns.com/foaf/0.1/Person'],
                                defaultValue: ['http://xmlns.com/foaf/0.1/Person'],
                                allowUserDefinedValue: 1
                            },
                            'http://www.w3.org/2000/01/rdf-schema#label': {
                                value: 'Label',
                                valueType: 'literal',
                                hint: ['A descriptor label for the URI'],
                                label: ['Label']
                            },
                            'http://xmlns.com/foaf/0.1/mbox': {
                                value: 'email address',
                                valueType: 'literal',
                                hint: ['A corresponding email address'],
                                label: ['Email']
                            }
                        }
                    }
                },
                'http://purl.org/dc/terms/contributor': {
                    allowNewValue: 1,
                    allowExtension: 1,
                    category: ['people'],
                    label: ['Contributor'],
                    hint: ['An entity, such as a person, organisation, or service, that is responsible for making contributions to the dataset. The contributor should be described using a URI if available, rather than just providing the name as a literal.'],
                    editor: ['DBpediaInput'],
                    viewer: ['BasicDBpediaView'],
                    extendedViewer: ['BasicIndividualDetailView'],
                    extensions: {
                        config: {
                            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                                valueType: 'uri',
                                hint: ['Type of the entity'],
                                label: ['Type'],
                                viewer: ['BasicOptionView'],
                                editor: ['BasicOptionInput'],
                                options: [
                                    {label: 'Person', value: 'http://xmlns.com/foaf/0.1/Person'},
                                    {label: 'Organization', value: 'http://xmlns.com/foaf/0.1/Organization'}
                                ],
                                value: ['http://xmlns.com/foaf/0.1/Person'],
                                defaultValue: ['http://xmlns.com/foaf/0.1/Person'],
                                allowUserDefinedValue: 1
                            },
                            'http://www.w3.org/2000/01/rdf-schema#label': {
                                value: 'Label',
                                valueType: 'literal',
                                hint: ['A descriptor label for the URI'],
                                label: ['Label']
                            },
                            'http://xmlns.com/foaf/0.1/mbox': {
                                value: 'email address',
                                valueType: 'literal',
                                hint: ['A corresponding email address'],
                                label: ['Email']
                            }
                        }
                    }
                },
                'http://purl.org/dc/terms/created': {
                    label: ['Created date'],
                    category: ['date'],
                    hint: ['A point or period of time associated with an event in the life-cycle of the resource. The value should be formatted as date and time format - ISO 8601']
                },
                'http://purl.org/dc/terms/issued': {
                    label: ['Date issued'],
                    category: ['date'],
                    hint: ['A point or period of time associated with an event in the life-cycle of the resource. The value should be formatted as date and time format - ISO 8601.']
                },
                'http://purl.org/dc/terms/modified': {
                    label: ['Date modified'],
                    category: ['date'],
                    hint: ['A point or period of time associated with an event in the life-cycle of the resource. The value should be formatted as date and time format - ISO 8601']
                },
                'http://purl.org/dc/terms/license': {
                    category: ['legalAspects'],
                    label: ['License'],
                    hint: ['Data without explicit license is a potential legal liability and leaves consumers unclear what the usage conditions are. Therefore, it is very important that publishers make explicit the terms under which the dataset can be used.'],
                    allowNewValue: 1,
                    viewer: ['BasicOptionView'],
                    editor: ['BasicOptionInput'],
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
                'http://purl.org/dc/terms/rights': {
                    label: ['Rights'],
                    category: ['legalAspects'],
                    hint: ['This describes the rights under which the dataset can be used/reused.']
                },
                'http://purl.org/dc/terms/format': {
                    label: ['Dataset File format'],
                    allowNewValue: 1,
                    category: ['technicalAspects'],
                    hint: ['Technical features of a dataset.'],
                    editor: ['MediaTypeInput'],
                    allowUserDefinedValue: 1
                },
                'http://rdfs.org/ns/void#dataDump': {
                    label: ['Download address'],
                    category: ['technicalAspects'],
                    hint: ['If the dataset is available, then its location can be announced using this attribute. If the dataset is split into multiple dumps, then several values of this property can be provided.']
                },
                'http://rdfs.org/ns/void#exampleResource': {
                    label: ['Example of the resource'],
                    category: ['overview'],
                    hint: ['For documentation purposes, it can be helpful to name some representative example entities for a dataset. Looking up these entities allows users to quickly get an impression of the kind of data that is present in a dataset.'],
                    allowNewValue: 1
                },
                'http://rdfs.org/ns/void#vocabulary': {
                    isHidden: 1,
                    label: ['Vocabulary'],
                    category: ['overview'],
                    hint: ['Vocabularies used in the dataset.']
                },
                'http://www.w3.org/ns/dcat#byteSize': {
                    label: ['Size of the dataset'],
                    category: ['technicalAspects'],
                    hint: ['The size of the dataset. For example we could say that the dataset is 1.0 GB or 1024.0 MB'],
                    editor: ['FileSizelInput'],
                    viewer: ['FileSizeView']
                },
                'http://www.w3.org/ns/dcat#accessURL': {
                    label: ['Access URL'],
                    category: ['technicalAspects'],
                    hint: ['A landing page, feed, SPARQL endpoint or other type of resource that gives access to the distribution of the dataset'],
                    allowNewValue: 1
                },
                'http://xmlns.com/foaf/0.1/homepage': {
                    label: ['Home Page'],
                    category: ['overview'],
                    hint: ['Web page where further information about the dataset can be found.']
                },
                'http://xmlns.com/foaf/0.1/page': {
                    label: ['Additional web pages'],
                    category: ['overview'],
                    hint: ['Additional web pages with relevant information that can not be considered the homepage of the dataset.'],
                    allowNewValue: 1
                },
                'http://vocab.org/waiver/terms/norms': {
                    label: ['Terms of use'],
                    category: ['legalAspects'],
                    hint: ['Norms are non-binding conditions of use that publishers would like to encourage the users of their data to adopt. representing the community norms for access and use of a resource.']
                },
                'http://vocab.org/waiver/terms/waiver': {
                    label: ['Waiver'],
                    category: ['legalAspects'],
                    hint: ['To the extent possible under law, The Example Organisation has waived all copyright and related or neighboring rights to The Example Dataset.'],
                    editor: ['BasicTextareaInput']
                },
                'http://purl.org/pav/version': {
                    isHidden: 1,
                    label: ['Version'],
                    category: ['overview'],
                    hint: ['The version of the dataset described by this document']
                }
            }
        },
        //for each graph name, you can define custom configs.
        //if no custom config is defined for a specific graph, the generic config will be used.
        'http://ld-r.org/users': {
            //only allow to view data -> disable edit
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
                    extensions: {
                        config: {
                            'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#resource': {
                                value: 'http://exampleResource.org',
                                valueType: 'uri',
                                hint: ['Resource URI under which the property is exposed.'],
                                label: ['Resource']
                            },
                            'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#property': {
                                value: 'http://exampleProperty.org',
                                valueType: 'uri',
                                hint: ['Property URI'],
                                label: ['Property']
                            }
                        }
                    }
                },
                'http://xmlns.com/foaf/0.1/organization': {
                    label: ['Institution Name'],
                    allowNewValue: 1,
                    viewer: ['BasicDBpediaView'],
                    editor: ['DBpediaInput']
                },
                'http://www.w3.org/2001/vcard-rdf/3.0#ROLE': {
                    label: ['Position'],
                    hint: ['Position/Role in the organization. E.g. professor, lecturer, phd student, post doc, researcher, other...']
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
        },
        'http://risis.eu/cordisH2020': {
            list: [
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://risis.eu/cordisH2020/vocab/projectParticipant',
                'http://risis.eu/cordisH2020/vocab/fundingScheme',
                'http://risis.eu/cordisH2020/vocab/topic',
                'http://risis.eu/cordisH2020/vocab/totalCost',
                'http://risis.eu/cordisH2020/vocab/callID',
                'http://rdf-vocabulary.ddialliance.org/discovery#startDate',
                'http://risis.eu/cordisH2020/vocab/durationMonths'
            ],
            config: {
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                    label: ['Type'],
                    hint: ['Type of the resource under investigation.']
                },
                'http://risis.eu/cordisH2020/vocab/projectParticipant': {
                    label: ['Participant'],
                    hasLinkedValue: 1
                },
                'http://risis.eu/cordisH2020/vocab/fundingScheme': {
                    label: ['Funding Scheme'],
                    hasLinkedValue: 1
                },
                'http://risis.eu/cordisH2020/vocab/topic': {
                    label: ['Topic'],
                    hasLinkedValue: 1
                }
            }
        }
    }
};
