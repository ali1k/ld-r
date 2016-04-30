FROM node:6.0-slim
MAINTAINER Ali Khalili "hyperir@gmail.com"

# Update aptitude with new repo
RUN apt-get update
# Install software
RUN apt-get install -y git

RUN mkdir /ld-r
WORKDIR /ld-r

RUN npm install bower -g
RUN npm install webpack -g

ADD bower.json /ld-r/
RUN bower install --allow-root

ADD package.json /ld-r/
RUN npm install

ADD . /ld-r
#handle initial configs
RUN if [ ! -e "/ld-r/configs/general.js" ]; then cp /ld-r/configs/general.config.js /ld-r/configs/general.js ; fi
RUN if [ ! -e "/ld-r/configs/server.js" ]; then cp /ld-r/configs/server.config.js /ld-r/configs/server.js ; fi
RUN if [ ! -e "/ld-r/configs/reactor.js" ]; then cp /ld-r/configs/reactor.config.js /ld-r/configs/reactor.js ; fi
RUN if [ ! -e "/ld-r/configs/facets.js" ]; then cp /ld-r/configs/facets.config.js /ld-r/configs/facets.js ; fi
RUN if [ ! -e "/ld-r/plugins/email/config.js" ]; then cp /ld-r/plugins/email/config.sample.js /ld-r/plugins/email/config.js ; fi

#specify the port used by ld-r app
EXPOSE 4000

ENTRYPOINT ["npm", "run", "build"]
