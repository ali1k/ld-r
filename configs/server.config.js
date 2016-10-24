//important: first value in the array is considered as default value for the property
//this file is visible to the server-side
export default {
    serverPort: [4000],
    sparqlEndpoint: {
        'generic': {
            host: 'localhost', port: 8890, path: '/sparql', type: 'virtuoso'
        },
        'http://localhost:5820/testDB/query': {
            host: 'localhost', port: 5820, path: '/testDB/query', useDefaultGraph: 1, type: 'sesame', useReasoning: 1
        }
    },
    dbpediaLookupService: [
        { host: 'lookup.dbpedia.org' }
    ],
    //it is used only if you enabled recaptcha feature for user authentication
    //get keys from https://www.google.com/recaptcha
    googleRecaptchaService: {
        siteKey: ['put your google recaptcha site key here...'],
        secretKey: ['put your google recaptcha secret key here...']
    }
};
