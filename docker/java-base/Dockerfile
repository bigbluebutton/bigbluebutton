# Runtime base of the Java images: the JRE and the bigbluebutton user of the packages.
FROM eclipse-temurin:21-jre-noble@sha256:35501d3f93173b420ac9001658eb68157e813316b865087e345c187fca422c4c

RUN groupadd -g 998 bigbluebutton \
    && useradd -m -u 998 -g bigbluebutton bigbluebutton
