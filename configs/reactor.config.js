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
    //config for property components
    propertiesConfig: {
        'http://purl.org/dc/terms/title': {
            category: ['general'],
            hint: ['The title of dataset'],
            defaultOptions: [

            ],
            reactorType: ['IndividualObjectReactor'],
            dataViewType: ['IndividualDataView'],
            viewer: ['BasicIndividualView'],
            dataEditType: ['IndividualDataEdit'],
            editor: ['BasicIndividualInput']
        },
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
            isHidden: 1,
            category: ['general']
        },
        'http://purl.org/dc/terms/format': {
            allowNewValue: 1,
            category: ['structural']
        },
        'http://purl.org/dc/terms/description': {
            category: ['general'],
            editor: ['BasicTextareaInput']
        },
        'http://purl.org/dc/terms/contributor': {
            allowNewValue: 1,
            allowExtension: 1,
            category: ['general'],
            hint: ['An entity, such as a person, organisation, or service, that is responsible for making contributions to the dataset. The contributor should be described using a URI if available, rather than just providing the name as a literal.'],
            extendedViewer: ['BasicIndividualDetailView']
        }
    }
};
