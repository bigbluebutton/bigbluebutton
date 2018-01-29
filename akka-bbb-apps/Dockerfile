FROM sbt:0.13.8

ARG COMMON_VERSION

COPY ./bbb-common-message /bbb-common-message

RUN cd /bbb-common-message \
 && sed -i "s|\(version := \)\".*|\1\"$COMMON_VERSION\"|g" build.sbt \
 && echo 'publishTo := Some(Resolver.file("file",  new File(Path.userHome.absolutePath+"/.m2/repository")))' | tee -a build.sbt \
 && sbt compile \
 && sbt publishLocal

COPY ./akka-bbb-apps /source

RUN cd /source \
 && find -name build.gradle -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^:]*\):.*|\1:$COMMON_VERSION'|g" {} \; \
 && find -name build.sbt -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^\"]*\"[ ]*%[ ]*\)\"[^\"]*\"\(.*\)|\1\"$COMMON_VERSION\"\2|g" {} \; \
 && sbt compile

WORKDIR /source

CMD ["sbt", "run"]

