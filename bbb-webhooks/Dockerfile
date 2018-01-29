FROM node:8

ADD . /source
RUN cp /source/config_local.coffee.example /source/config_local.coffee

ENV NODE_ENV production

RUN cd /source \
 && npm install \
 && npm cache clear --force

WORKDIR /source

EXPOSE 3005

CMD ["node", "app.js"]
