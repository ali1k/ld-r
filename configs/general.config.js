//important: first value in the array is considered as default value for the property
//this file is visible to the server-side
export default {
    serverPort: [4000],
    sparqlEndpoint: [
        { host: 'localhost', port: 8890, path: '/sparql' }
    ],
    dbpediaLookupService: [
        { host: 'lookup.dbpedia.org' }
    ]
};
