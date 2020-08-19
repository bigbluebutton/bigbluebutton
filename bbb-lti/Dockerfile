FROM java:8-jdk AS builder

RUN mkdir -p /root/tools \
 && cd /root/tools \
 && wget https://services.gradle.org/distributions/gradle-2.12-bin.zip \
 && unzip gradle-2.12-bin.zip \
 && ln -s gradle-2.12 gradle

RUN mkdir -p /root/tools \
 && cd /root/tools \
 && wget https://github.com/grails/grails-core/releases/download/v2.5.2/grails-2.5.2.zip \
 && unzip grails-2.5.2.zip \
 && ln -s grails-2.5.2 grails

ENV PATH="/root/tools/gradle/bin:/root/tools/grails/bin:${PATH}"

COPY . /source

# build with:
# docker build -t mconftec/bbb-lti --build-arg title=Mconf --build-arg description='Single Sign On into Mconf' --build-arg vendor_code=mconf --build-arg vendor_name=Mconf --build-arg vendor_description='Mconf web conferencing' --build-arg vendor_url=https://mconf.com .

ARG title=BigBlueButton
ARG description='Single Sign On into BigBlueButton'
ARG vendor_code=bigbluebutton
ARG vendor_name=BigBlueButton
ARG vendor_description='Open source web conferencing system for distance learning.'
ARG vendor_url=http://www.bigbluebutton.org/

RUN cd /source \
 && sed -i "s|\(<blti:title>\)[^<]*|\1$title|g" grails-app/controllers/org/bigbluebutton/ToolController.groovy \
 && sed -i "s|\(<blti:description>\)[^<]*|\1$description|g" grails-app/controllers/org/bigbluebutton/ToolController.groovy \
 && sed -i "s|\(<lticp:code>\)[^<]*|\1$vendor_code|g" grails-app/controllers/org/bigbluebutton/ToolController.groovy \
 && sed -i "s|\(<lticp:name>\)[^<]*|\1$vendor_name|g" grails-app/controllers/org/bigbluebutton/ToolController.groovy \
 && sed -i "s|\(<lticp:description>\)[^<]*|\1$vendor_description|g" grails-app/controllers/org/bigbluebutton/ToolController.groovy \
 && sed -i "s|\(<lticp:url>\)[^<]*|\1$vendor_url|g" grails-app/controllers/org/bigbluebutton/ToolController.groovy \
 && sed -i "s|BigBlueButton|$title|g" grails-app/i18n/*.properties \
 && grails war

FROM tomcat:7-jre8

WORKDIR $CATALINA_HOME

# clean default webapps
RUN rm -r webapps/*

COPY --from=builder /source/target/lti-*.war webapps/lti.war

COPY docker-entrypoint.sh /usr/local/bin/

ENV LTI_CONTEXT_PATH lti

CMD ["docker-entrypoint.sh"]
