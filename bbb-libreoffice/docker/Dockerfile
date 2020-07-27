FROM openjdk:8-jre

ENV DEBIAN_FRONTEND noninteractive

RUN apt update

ARG user_id
RUN echo "User id = $user_id"

RUN addgroup --system --gid $user_id libreoffice

# We need to ensure that this user id is the same as the user bigbluebutton in the host
RUN adduser --disabled-password --system --disabled-login --shell /sbin/nologin --gid $user_id --uid $user_id libreoffice

RUN apt -y install locales-all fontconfig libxt6 libxrender1 
RUN apt -y install libreoffice --no-install-recommends

RUN dpkg-reconfigure fontconfig && fc-cache -f -s -v

VOLUME ["/usr/share/fonts/"]
RUN chown libreoffice /home/libreoffice/

ADD ./bbb-libreoffice-entrypoint.sh /home/libreoffice/
RUN chown -R libreoffice /home/libreoffice/
RUN chmod 700 /home/libreoffice/bbb-libreoffice-entrypoint.sh

USER libreoffice

ENTRYPOINT ["/home/libreoffice/bbb-libreoffice-entrypoint.sh" ] 
