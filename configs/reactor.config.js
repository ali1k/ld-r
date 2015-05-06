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
            defaultOptions: [

            ],
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
        'http://purl.org/dc/terms/language': {
            allowNewValue: 1
        },
        'http://purl.org/dc/terms/subject': {
            category: ['general'],
            label: ['Keywords'],
            allowNewValue: 1
        }
    }
};
