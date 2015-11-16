[![Dependency Status](https://david-dm.org/ali1k/ld-r.svg)](https://david-dm.org/ali1k/ld-r)
[![devDependency Status](https://david-dm.org/ali1k/ld-r/dev-status.svg)](https://david-dm.org/ali1k/ld-r#info=devDependencies)

# Linked Data Reactor

Linked Data Reactor (LD-Reactor or LD-R) is a framework to develop reactive and reusable User Interface components for Linked Data applications. LD-Reactor utilizes Facebook's ReactJS components, Flux architecture and Yahoo!'s Fluxible framework for isomorphic Web applications. It also exploits Semantic-UI framework for flexible UI themes. LD-Reactor aims to apply the idea of component-based application development into RDF data model hence enhancing current user interfaces to view, browse and edit Linked Data.

## Quick Start

###Installation

You should have installed [NodeJS](https://nodejs.org/), [npm](https://github.com/npm/npm), [bower](http://bower.io/) and [Webpack](https://webpack.github.io/) on your system as prerequisite, then:

Clone the repository: `git clone https://github.com/ali1k/ld-r.git`

and simply run `./install` script

###Configuration
Fill in general settings for your application at `configs/general.js`.

Fill in appropriate values for server port, URLs of your SPARQL endpoint and DBpedia lookup service at `configs/server.js`.

Fll in appropriate settings for your UI reactors at `configs/reactor.js`.

Fill in appropriate settings for the faceted browser at `configs/facets.js`.

###Run in Production Mode

`npm run build`

check server at `localhost:4000`

###Development Mode

`npm run dev`

check server at `localhost:3000`

## Documentation

Check out http://ld-r.org for detailed documentation.
