FROM node:8

ADD . /source
RUN cp /source/config/default.example.yml /source/config/production.yml

ENV NODE_ENV production

RUN cd /source \
 && mv docker-entrypoint.sh /usr/local/bin/ \
 && npm install \
 && npm cache clear --force

WORKDIR /source

EXPOSE 3008

CMD [ "docker-entrypoint.sh" ]
