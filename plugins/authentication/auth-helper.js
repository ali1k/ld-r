var config = require('../../configs/server');

module.exports = {
  getEndpointParameters: function(graphName) {
        let httpOptions, g;
        if(config.sparqlEndpoint[graphName]){
            g = graphName;
        }else{
            //go for generic SPARQL endpoint
            g = 'generic';
        }
        httpOptions = {
          host: config.sparqlEndpoint[g].host,
          port: config.sparqlEndpoint[g].port,
          path: config.sparqlEndpoint[g].path
        };
        let useDefaultGraph = 0;
        if(config.sparqlEndpoint[g].useDefaultGraph){
            useDefaultGraph = 1;
        }
        let etype = config.sparqlEndpoint[g].type ? config.sparqlEndpoint[g].type : 'virtuoso';
        return {httpOptions: httpOptions, type: etype, useDefaultGraph: useDefaultGraph};
  },
  getHTTPQuery: function(mode, query, endpointParameters, outputFormat) {
        let url, output = '&Accept=' + encodeURIComponent(outputFormat), ext ='';
        let qParam= 'query';
        if(mode === 'update'){
            ext = '/statements';
            qParam = 'update';
            output= '';
        }
        switch (endpointParameters.type) {
            case 'virtuoso':
                url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + '?query=' + encodeURIComponent(query) + '&format=' + encodeURIComponent(outputFormat);
            break;
            case 'sesame':
                url = 'http://' + endpointParameters.httpOptions.host + ':' + endpointParameters.httpOptions.port + endpointParameters.httpOptions.path + ext + '?' + qParam + '=' + encodeURIComponent(query) + output;
            break;
        }
        return url;
  }
}
