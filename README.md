[![Dependency Status](https://david-dm.org/ali1k/ld-r.svg)](https://david-dm.org/ali1k/ld-r)
[![devDependency Status](https://david-dm.org/ali1k/ld-r/dev-status.svg)](https://david-dm.org/ali1k/ld-r#info=devDependencies)

# Linked Data Reactor

Linked Data Reactor aims to build a set of reactive and reusable UI components to facilitate building Linked Data applications. LD-Reactor utilizes Facebook's ReactJS components, Flux architecture and Yahoo!'s Fluxible framework for isomorphic web applications. LD-Reactor applies the idea of component-based application development into RDF data model to enhance user interfaces to view, browse and edit Linked Data. It also exploits Semantic-UI framework for providing flexible UI themes.

## Installation
simple run `./install` script

## Configuration
Fill in appropriate values for server port, URLs of your SPARQL endpoint and DBpedia lookup service at `configs/general.js`.

Fll in appropriate settings for your UI reactors at `configs/reactor.js`.

## Run in Production Mode
`npm run build`

check server at `localhost:4000`

## Development Mode

`npm run dev` or `grunt` or `PORT=4000 DEBUG=* grunt`
