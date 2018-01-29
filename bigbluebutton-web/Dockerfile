FROM tomcat:7-jre8

ARG COMMON_VERSION
ARG SBT_VERSION

RUN apt-get update \
 && apt-get -y install openjdk-8-jdk-headless \
 && apt-get -y install imagemagick xpdf-utils libreoffice ttf-liberation psmisc fonts-crosextra-carlito fonts-crosextra-caladea

ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64

RUN cp $JAVA_HOME/lib/tools.jar $JAVA_HOME/jre/lib/ext/tools.jar

RUN curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb \
 && dpkg -i sbt-$SBT_VERSION.deb \
 && rm sbt-$SBT_VERSION.deb \
 && apt-get update \
 && apt-get install sbt \
 && sbt sbtVersion

RUN echo 'resolvers += "Artima Maven Repository" at "http://repo.artima.com/releases"' | tee -a ~/.sbt/0.13/global.sbt

RUN mkdir -p /root/tools \
 && cd ~/tools \
 && wget http://services.gradle.org/distributions/gradle-2.12-bin.zip \
 && unzip gradle-2.12-bin.zip \
 && ln -s gradle-2.12 gradle

RUN mkdir -p /root/tools \
 && cd /root/tools \
 && wget https://github.com/grails/grails-core/releases/download/v2.5.2/grails-2.5.2.zip \
 && unzip grails-2.5.2.zip \
 && ln -s grails-2.5.2 grails

ENV PATH="/root/tools/gradle/bin:/root/tools/grails/bin:${PATH}"

COPY ./bbb-common-message /bbb-common-message

RUN cd /bbb-common-message \
 && sed -i "s|\(version := \)\".*|\1\"$COMMON_VERSION\"|g" build.sbt \
 && echo 'publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/.m2/repository")))' | tee -a build.sbt \
 && sbt compile \
 && sbt publish \
 && sbt publishLocal

COPY ./bbb-common-web /bbb-common-web

RUN cd /bbb-common-web \
 && sed -i "s|\(version := \)\".*|\1\"$COMMON_VERSION\"|g" build.sbt \
 && find -name build.sbt -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^\"]*\"[ ]*%[ ]*\)\"[^\"]*\"\(.*\)|\1\"$COMMON_VERSION\"\2|g" {} \; \
 && echo 'publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/.m2/repository")))' | tee -a build.sbt \
 && sbt compile \
 && sbt publish \
 && sbt publishLocal

COPY ./bigbluebutton-web /source

RUN cd /source \
 && find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^:]*\):.*|\1:$COMMON_VERSION'|g" {} \; \
 && find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-web[^:]*\):.*|\1:$COMMON_VERSION'|g" {} \; \
 && gradle resolveDeps \
 && grails war \
 && mv target/bigbluebutton-0.9.0.war $CATALINA_HOME/webapps/bigbluebutton.war

CMD ["catalina.sh", "run"]

