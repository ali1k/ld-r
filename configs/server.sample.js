//important: first value in the array is considered as default value for the property
//this file is visible to the server-side
export default {
    serverPort: [4000],
    sparqlEndpoint: {
        'generic': {
            host: 'localhost', port: 8890, path: '/sparql', endpointType: 'virtuoso'
        },
        //Note: if graphName is not specified, the identifer used for configuration will be used as graphName
        //Example config for connecting to a Stardog triple store, replace testDB with the name of your DB
        // read more at https://www.stardog.com/docs/#_stardog_resources
        'http://localhost:5820/testDB': {
            host: 'localhost', port: 5820, path: '/testDB', graphName: 'default', endpointType: 'stardog', useReasoning: 1
        },
        //Example for connecting to a Virtuoso triple store
        'http://dbpedia.org/sparql': {
            host: 'dbpedia.org', port: 80, path: '/sparql', graphName: 'default', endpointType: 'virtuoso'
        },
        //Example for connecting to a ClioPatria triple store
        'http://localhost:3020/sparql/': {
            host: 'localhost', port: 3020, path: '/sparql/', endpointType: 'ClioPatria'
        }
    },
    dbpediaLookupService: [
        { host: 'lookup.dbpedia.org' }
    ],
    dbpediaSpotlightService: [
        { host: 'model.dbpedia-spotlight.org', port: 80, path: '/en/annotate' }
    ],
    //it is used only if you enabled recaptcha feature for user authentication
    //get keys from https://www.google.com/recaptcha
    googleRecaptchaService: {
        siteKey: ['put your google recaptcha site key here...'],
        secretKey: ['put your google recaptcha secret key here...']
    }
};
