FROM node:8

COPY . /source

RUN set -x \
 && curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh \
 && useradd -m -G users -s /bin/bash meteor \
 && chown -R meteor:meteor /source

USER meteor

RUN cd /source \
 && meteor npm install

WORKDIR /source

ENV MONGO_URL=mongodb://mongo:27017/html5client \
    PORT=3000 \
    ROOT_URL=http://localhost:3000

EXPOSE 3000

CMD ["npm", "start"]

