FROM eclipse-temurin:17-jre-jammy

RUN apt-get update && apt-get install -y \
        wget unzip gosu locales \
        imagemagick xpdf-utils curl \
    && sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG=en_US.UTF-8  
ENV LANGUAGE=en_US:en  
ENV LC_ALL=en_US.UTF-8     

# add user & group
RUN groupadd -g 998 bigbluebutton \
    && useradd -m -u 998 -g bigbluebutton bigbluebutton \
    && mkdir /etc/bigbluebutton \
    && chown bigbluebutton:bigbluebutton /etc/bigbluebutton
