//important: first value in the array is considered as default value for the property
//this file is visible to the server-side
export default {
    appFullTitle: ['Linked Data Reactor'],
    appShortTitle: ['LD-Reactor'],
    serverPort: [4000],
    sparqlEndpoint: {
        'generic': {
            host: 'localhost', port: 8890, path: '/sparql'
        }
    },
    dbpediaLookupService: [
        { host: 'lookup.dbpedia.org' }
    ]
};
