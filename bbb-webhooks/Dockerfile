FROM node:8-slim

ADD . app

WORKDIR app

RUN cp config_local.js.example config_local.js

ENV NODE_ENV production

RUN npm install \
 && npm cache clear --force

EXPOSE 3005

CMD ["node", "app.js"]
