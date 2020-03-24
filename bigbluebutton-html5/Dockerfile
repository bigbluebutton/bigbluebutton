FROM node:12

RUN set -x \
 && curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh \
 && useradd -m -G users -s /bin/bash meteor

# install add-apt-repository
RUN apt-get update \
    && apt-get install software-properties-common -y

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CC86BB64 \
    && add-apt-repository ppa:rmescandon/yq \
    && apt update \
    && apt install yq -y
# RUN apt-get update && apt-get -y install jq

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
    KURENTO_WSURL=HOST \
    KURENTO_VIDEO=true \
    KURENTO_LISTEN_ONLY=true \
    KURENTO_SCREENSHARING=true \
    SCREENSHARE_EXTENSION_KEY=KEY \
    SCREENSHARE_EXTENSION_LINK=LINK

EXPOSE 3000

CMD ["docker-entrypoint.sh"]
