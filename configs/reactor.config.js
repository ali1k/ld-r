//important: first value in the array is considered as default value for the property
//this file is visible to the server-side
export default {
    //Default Named Graph under observation
    defaultGraphName: [''],
    //resource types to start with
    resourceFocusType: [''],
    //only allow to view data -> disable edit
    readOnly: 0,
    //config for property components
    propertiesConfig: {
        'dcterms:title': {
            category: ['general'],
            hint: [''],
            defaultOptions: [

            ],
            reactorType: ['IndividualObjectReactor'],
            dataViewType: ['IndividualDataView'],
            viewer: ['BasicIndividualView'],
            dataEditType: ['IndividualDataEdit'],
            editor: ['BasicIndividualInput']
        }
    }
};
