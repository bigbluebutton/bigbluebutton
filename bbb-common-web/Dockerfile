FROM bbb-common-message

ARG COMMON_VERSION=0.0.1-SNAPSHOT

COPY . /bbb-common-web

RUN cd /bbb-common-web \
 && sed -i "s|\(version := \)\".*|\1\"$COMMON_VERSION\"|g" build.sbt \
 && find -name Dependencies.scala -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^\"]*\"[ ]*%[ ]*\)Versions\.bbbCommons\(.*\)|\1\"$COMMON_VERSION\"\2|g" {} \; \
 && sbt compile \
 && sbt publish \
 && sbt publishLocal
