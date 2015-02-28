FROM node:0.12
MAINTAINER github@stefanlau.com

RUN mkdir /app
RUN git clone --single-branch --branch "0.4.1" https://github.com/selaux/miner-dashboard.git /app
RUN mv /app/config/config.example.js /app/config/config.js
RUN cd /app; npm install
RUN cd /app; node_modules/.bin/grunt compile

EXPOSE 3000
CMD node /app/app.js -c /app/config/config.js
