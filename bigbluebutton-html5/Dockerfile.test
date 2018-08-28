FROM ubuntu:16.04
MAINTAINER ffdixon@bigbluebutton.org

ENV DEBIAN_FRONTEND noninteractive
# RUN echo 'Acquire::http::Proxy "http://192.168.0.130:3142 ";'  > /etc/apt/apt.conf.d/01proxy
RUN apt-get update && apt-get install -y wget software-properties-common

RUN echo "deb http://ubuntu.bigbluebutton.org/xenial-200-dev bigbluebutton-xenial main   " | tee /etc/apt/sources.list.d/bigbluebutton.list
RUN wget http://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc -O- | apt-key add -
RUN add-apt-repository ppa:jonathonf/ffmpeg-4 -y
RUN apt-get update && apt-get -y dist-upgrade

# -- Setup tomcat7 to run under docker
RUN apt-get install -y \
  haveged    \
  net-tools  \
  supervisor \
  sudo       \
  tomcat7

RUN sed -i 's|securerandom.source=file:/dev/random|securerandom.source=file:/dev/urandom|g'  /usr/lib/jvm/java-8-openjdk-amd64/jre/lib/security/java.security
ADD mod/tomcat7 /etc/init.d/tomcat7
RUN chmod +x /etc/init.d/tomcat7

RUN apt-get install -y language-pack-en
RUN update-locale LANG=en_US.UTF-8

# -- Install BigBlueButton
RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections
RUN apt-get install -y bigbluebutton 
RUN apt-get install -y bbb-demo 

# -- Install mongodb (for HTML5 client)
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
RUN echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
RUN sudo apt-get update && sudo apt-get install -y mongodb-org curl

# -- Install nodejs (for HTML5 client)
RUN apt-get install -y apt-transport-https
RUN curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
RUN echo 'deb http://deb.nodesource.com/node_8.x xenial main' > /etc/apt/sources.list.d/nodesource.list
RUN echo 'deb-src http://deb.nodesource.com/node_8.x xenial main' >> /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y nodejs 

# -- Install HTML5 client
RUN apt-get install -y bbb-html5
RUN apt-get install -y coturn vim mlocate

# -- Install Meteor
RUN curl https://install.meteor.com/ | sh
ENV METEOR_ALLOW_SUPERUSER true

# -- Install supervisor to run all the BigBlueButton processes (replaces systemd)
RUN apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor
ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# -- Modify FreeSWITCH event_socket.conf.xml to listen to IPV4
ADD mod/event_socket.conf.xml /opt/freeswitch/etc/freeswitch/autoload_configs
ADD mod/external.xml          /opt/freeswitch/conf/sip_profiles/external.xml

# -- Install latest HTML5 client from source
RUN supervisorctl stop bbb-html5
ADD . /bigbluebutton-html5
WORKDIR /bigbluebutton-html5
RUN meteor npm install
WORKDIR /

# -- Finish startup
ADD setup.sh /root/setup.sh
ENTRYPOINT ["/root/setup.sh"]
CMD []
