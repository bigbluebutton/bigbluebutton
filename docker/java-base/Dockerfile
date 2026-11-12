# Runtime base of the Java images: the JRE and the bigbluebutton user of the packages.
FROM eclipse-temurin:21-jre-noble@sha256:0eda5830ed7b669abc246a8dc520ea8a23cab06f9a8d4b6964109e2f2394e46f

RUN groupadd -g 998 bigbluebutton \
    && useradd -m -u 998 -g bigbluebutton bigbluebutton
