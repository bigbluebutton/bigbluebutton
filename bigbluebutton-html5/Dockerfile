FROM node:8

ADD . /source

RUN set -x \
 && curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh \
 && useradd -m -G users -s /bin/bash meteor \
 && mkdir /app \
 && chown -R meteor:meteor /source \
 && chown -R meteor:meteor /app

USER meteor

RUN cd /source \
 && meteor npm install \
 && meteor build --directory /app

ENV NODE_ENV production

RUN cd /app/bundle/programs/server \
 && npm install \
 && npm cache clear --force

WORKDIR /app/bundle

ENV MONGO_URL=mongodb://mongo:27017/html5client \
    PORT=3000 \
    ROOT_URL=http://localhost:3000

EXPOSE 3000

CMD ["node", "main.js"]
