FROM node:8

RUN set -x \
 && curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh \
 && useradd -m -G users -s /bin/bash meteor

RUN apt-get update && apt-get -y install jq

COPY . /source

RUN cd /source \
 && mv docker-entrypoint.sh /usr/local/bin/ \
 && chown -R meteor:meteor . \
 && mkdir /app \
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
    ROOT_URL=http://localhost:3000 \
    METEOR_SETTINGS_MODIFIER=.

EXPOSE 3000

CMD ["docker-entrypoint.sh"]
