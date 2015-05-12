//important: first value in the array is considered as default value for the property
//this file is visible to the server-side
export default {
    //Default Named Graph under observation
    defaultGraphName: [''],
    //resource types to start with
    resourceFocusType: [''],
    //only allow to view data -> disable edit
    readOnly: 0,
    //if enabled, will categorize properties in different tabs based on propertyCategories
    usePropertyCategories: 0,
    propertyCategories: [],
    //[Optional] config for property components
    propertiesConfig: {
        'http://purl.org/dc/terms/title': {
            category: ['general'],
            hint: ['The title of dataset.'],
            reactorType: ['IndividualObjectReactor'],
            dataViewType: ['IndividualDataView'],
            viewer: ['BasicIndividualView'],
            dataEditType: ['IndividualDataEdit'],
            editor: ['BasicIndividualInput']
        },
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
            //it will not affect the sub properties in detail
            isHidden: 1,
            category: ['general'],
            label: ['Type'],
            hint: ['Type of the entity.']
        },
        'http://purl.org/dc/terms/format': {
            allowNewValue: 1,
            category: ['structural']
        },
        'http://purl.org/dc/terms/language': {
            allowNewValue: 1,
            category: ['general'],
            viewer: ['LanguageView'],
            editor: ['LanguageInput'],
            defaultValue: ['http://id.loc.gov/vocabulary/iso639-1/en']
        },
        'http://purl.org/dc/terms/license': {
            category: ['general'],
            label: ['License'],
            allowNewValue: 1,
            options: [
                {label: 'Open Data Commons Public Domain Dedication and License (PDDL)', value: 'http://www.opendatacommons.org/licenses/pddl/'},
                {label: 'Open Data Commons Attribution License', value: 'http://www.opendatacommons.org/licenses/by/'},
                {label: 'Open Data Commons Open Database License (ODbL)', value: 'http://www.opendatacommons.org/licenses/odbl/'},
                {label: 'Creative Commons Public Domain Dedication', value: 'http://creativecommons.org/publicdomain/zero/1.0/'},
                {label: 'Creative Commons Attribution-ShareAlike', value: 'http://creativecommons.org/licenses/by-sa/3.0/'},
                {label: 'GNU Free Documentation License', value: 'http://www.gnu.org/copyleft/fdl.html'}
            ],
            defaultValue: ['http://creativecommons.org/licenses/by-sa/3.0/'],
            allowUserDefinedValue: 1,
            editor: ['BasicOptionInput'],
            viewer: ['BasicOptionView']
        },
        'http://purl.org/dc/terms/description': {
            category: ['general'],
            label: ['Description'],
            editor: ['BasicTextareaInput']
        },
        'http://purl.org/dc/terms/contributor': {
            allowNewValue: 1,
            allowExtension: 1,
            category: ['general'],
            label: ['Contributor'],
            hint: ['An entity, such as a person, organisation, or service, that is responsible for making contributions to the dataset. The contributor should be described using a URI if available, rather than just providing the name as a literal.'],
            editor: ['DBpediaInput'],
            viewer: ['BasicDBpediaView'],
            extendedViewer: ['BasicIndividualDetailView'],
            extensions: [
                {
                    spec: {
                        propertyURI: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                        value: 'http://xmlns.com/foaf/0.1/Person',
                        valueType: 'uri'
                    },
                    config: {
                        hint: ['Type of the entity'],
                        label: ['Type']
                    }
                },
                {
                    spec: {
                        propertyURI: 'http://www.w3.org/2000/01/rdf-schema#label',
                        value: 'Label',
                        valueType: 'literal'
                    },
                    config: {
                        hint: ['A descriptor label for the URI'],
                        label: ['Label']
                    }
                },
                {
                    spec: {
                        propertyURI: 'http://xmlns.com/foaf/0.1/mbox',
                        value: 'email address',
                        valueType: 'literal'
                    },
                    config: {
                        hint: ['A corresponding email address'],
                        label: ['Email']
                    }
                }
            ]
        },
        'http://purl.org/dc/terms/creator': {
            allowNewValue: 1,
            allowExtension: 1,
            category: ['general'],
            label: ['Creator'],
            hint: ['An entity, such as a person, organisation, or service, that is responsible for making contributions to the dataset. The contributor should be described using a URI if available, rather than just providing the name as a literal.'],
            extendedViewer: ['BasicIndividualDetailView']
        },
        'http://purl.org/dc/terms/subject': {
            category: ['structural'],
            label: ['Keywords'],
            allowNewValue: 1,
            reactorType: ['AggregateObjectReactor'],
            dataEditType: ['AggregateDataEdit'],
            editor: ['BasicAggregateInput'],
            editorI: ['DBpediaInput'],
            dataViewType: ['AggregateDataView'],
            viewer: ['BasicAggregateView'],
            viewerI: ['BasicDBpediaView']
        },
        'http://purl.org/dc/terms/temporal': {
            label: ['Time coverage'],
            category: ['general'],
            hint: ['Time coverage of the data itself but not of the data collection. For example we collect pictures in 2015 about the war. However, the pictures themselves could have been taken from 1939 to 1945. So the time coverage is 1939-1945.']
        },
        'http://purl.org/dc/terms/spatial': {
            label: ['Geographical coverage'],
            category: ['structural'],
            hint: ['The geographical area covered by the dataset.The same metadata could also be used to document the geographical area covered by an entity contained in the dataset in particular. For example we could say that the dataset covers all Eu countries or covers only France and Italy.'],
            allowNewValue: 1,
            reactorType: ['AggregateObjectReactor'],
            dataViewType: ['AggregateDataView'],
            viewer: ['DBpediaGoogleMapView'],
            viewerI: ['BasicDBpediaView'],
            editor: ['DBpediaInput']
        },
        'http://rdf-vocabulary.ddialliance.org/discovery#startDate': {
            label: ['Start date'],
            category: ['general'],
            hint: ['Start date of the time coverage.']
        },
        'http://rdf-vocabulary.ddialliance.org/discovery#endDate': {
            label: ['End date'],
            category: ['general'],
            hint: ['End date of the time coverage.']
        }
    }
};
