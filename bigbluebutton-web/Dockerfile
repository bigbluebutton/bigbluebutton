FROM bbb-common-web AS builder

RUN mkdir -p /root/tools \
 && cd /root/tools \
 && wget https://services.gradle.org/distributions/gradle-5.5.1-bin.zip \
 && unzip gradle-5.5.1-bin.zip \
 && ln -s gradle-5.5.1 gradle \
 && rm gradle-5.5.1-bin.zip

RUN mkdir -p /root/tools \
 && cd /root/tools \
 && wget https://github.com/grails/grails-core/releases/download/v3.3.9/grails-3.3.9.zip \
 && unzip grails-3.3.9.zip \
 && ln -s grails-3.3.9 grails \
 && rm grails-3.3.9.zip

ENV PATH="/root/tools/gradle/bin:/root/tools/grails/bin:${PATH}"

ARG COMMON_VERSION=0.0.20-SNAPSHOT

COPY . /source

#RUN cd /source \
# && find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^:]*\):.*|\1:$COMMON_VERSION'|g" {} \; \
# && find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-web[^:]*\):.*|\1:$COMMON_VERSION'|g" {} \;

RUN cd /source \
 && gradle resolveDeps \
 && grails package

FROM openjdk:8

WORKDIR /bbb-web

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update \
 && apt-get -y install imagemagick xpdf-utils netcat libreoffice fonts-crosextra-carlito fonts-crosextra-caladea unzip procps \
 && wget http://mirrors.kernel.org/ubuntu/pool/universe/libj/libjpeg9/libjpeg9_9c-2_amd64.deb \
 && dpkg -i libjpeg9*.deb \
 && rm libjpeg9*.deb \
 && wget http://archive.ubuntu.com/ubuntu/pool/universe/f/fonts-liberation/ttf-liberation_1.07.4-1_all.deb \
 && dpkg -i ttf-liberation*.deb \
 && rm ttf-liberation*.deb \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /source/build/libs/bigbluebutton-0.10.0.war /bbb-web/bigbluebutton.war

RUN jar -xvf /bbb-web/bigbluebutton.war && rm /bbb-web/bigbluebutton.war

COPY turn-stun-servers.xml.tmpl WEB-INF/classes/spring/turn-stun-servers.xml

COPY docker-entrypoint.sh docker-entrypoint.sh

COPY run-prod.sh run-prod.sh

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ./run-prod.sh