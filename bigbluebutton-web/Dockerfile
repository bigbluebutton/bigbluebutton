FROM bbb-common-web AS builder

RUN mkdir -p /root/tools \
 && cd /root/tools \
 && wget http://services.gradle.org/distributions/gradle-2.12-bin.zip \
 && unzip gradle-2.12-bin.zip \
 && ln -s gradle-2.12 gradle

RUN mkdir -p /root/tools \
 && cd /root/tools \
 && wget https://github.com/grails/grails-core/releases/download/v2.5.2/grails-2.5.2.zip \
 && unzip grails-2.5.2.zip \
 && ln -s grails-2.5.2 grails

ENV PATH="/root/tools/gradle/bin:/root/tools/grails/bin:${PATH}"

ARG COMMON_VERSION

COPY . /source

RUN cd /source \
 && find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^:]*\):.*|\1:$COMMON_VERSION'|g" {} \; \
 && find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-web[^:]*\):.*|\1:$COMMON_VERSION'|g" {} \;

RUN cd /source \
 && gradle resolveDeps \
 && grails war

FROM tomcat:7-jre8

WORKDIR $CATALINA_HOME

COPY --from=builder /source/target/bigbluebutton-0.9.0.war webapps/bigbluebutton.war

COPY docker_wrapper.sh .

RUN apt-get update \
 && apt-get -y install imagemagick xpdf-utils libreoffice ttf-liberation psmisc fonts-crosextra-carlito fonts-crosextra-caladea

RUN echo "deb http://ubuntu.bigbluebutton.org/xenial-200 bigbluebutton-xenial main " | tee /etc/apt/sources.list.d/bigbluebutton.list \
 && wget http://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc -O- | apt-key add - \
 && apt-get update \
 && apt-get -y install bbb-swftools

CMD [ "./docker_wrapper.sh" ]

