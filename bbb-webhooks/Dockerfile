FROM node:8-slim

ENV NODE_ENV production

WORKDIR /app

ADD package.json package-lock.json /app/

RUN npm install \
 && npm cache clear --force

ADD . /app

RUN cp config/default.example.yml config/default.yml

EXPOSE 3005

CMD ["node", "app.js"]
