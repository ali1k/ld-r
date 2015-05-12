[![Dependency Status](https://david-dm.org/ali1k/ld-reactor.svg)](https://david-dm.org/ali1k/ld-reactor)
[![devDependency Status](https://david-dm.org/ali1k/ld-reactor/dev-status.svg)](https://david-dm.org/ali1k/ld-reactor#info=devDependencies)

# Linked Data Reactor

Linked Data Reactor aims to build a set of reactive and reusable UI components to facilitate building Linked Data applications. LD-Reactor utilizes Facebook's ReactJS components, Flux architecture and Yahoo!'s Fluxible framework for isomorphic web applications. LD-Reactor applies the idea of component-based application development into RDF data model to enhance user interfaces to view, browse and edit Linked Data.

## Installation

Save `configs/general.config.js` as `general.js` and fill in the appropriate values for server port, URLs of your SPARQL endpoint and DBpedia lookup service.

Save `configs/reactor.config.js` as `reactor.js` and fill in the appropriate settings for your UI reactors.

`npm install`

`bower install`

`npm run dev`

for debug mode:
`PORT=4000 DEBUG=* grunt`

for production
`npm run build`

check server at `localhost:4000`
