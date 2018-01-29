FROM node:8

ADD . /source
RUN cp /source/config/default.example.yml /source/config/production.yml

ENV NODE_ENV production

RUN cd /source \
 && npm install \
 && npm cache clear --force

WORKDIR /source

EXPOSE 3008

CMD [ "./bbb-webrtc-sfu-run.sh" ]

