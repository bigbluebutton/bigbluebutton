FROM node:8

ADD . /source
RUN cp /source/config_local.js.example /source/config_local.js

ENV NODE_ENV production

RUN cd /source \
 && npm install \
 && npm cache clear --force

WORKDIR /source

EXPOSE 3005

CMD ["node", "app.js"]
