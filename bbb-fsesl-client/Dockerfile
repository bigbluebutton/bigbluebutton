FROM bbb-common-message

ARG COMMON_VERSION

COPY . /bbb-fsesl-client

RUN cd /bbb-fsesl-client \
 && sed -i "s|\(version := \)\".*|\1\"$COMMON_VERSION\"|g" build.sbt \
 && find -name Dependencies.sbt -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^\"]*\"[ ]*%[ ]*\)\"[^\"]*\"\(.*\)|\1\"$COMMON_VERSION\"\2|g" {} \; \
 && sbt compile \
 # && sbt publish \
 && sbt publishLocal
