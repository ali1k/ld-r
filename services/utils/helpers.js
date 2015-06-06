import {sparqlEndpoint} from '../../configs/general';

export default {
    getHTTPOptions: function(graphName) {
        let httpOptions, g;
        if(sparqlEndpoint[graphName]){
            g = graphName;
        }else{
            //go for generic SPARQL endpoint
            g = 'generic';
        }
        httpOptions = {
          host: sparqlEndpoint[g].host,
          port: sparqlEndpoint[g].port,
          path: sparqlEndpoint[g].path
        };
        return httpOptions;
    }
}
