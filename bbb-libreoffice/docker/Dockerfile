FROM openjdk:8-jre

ENV DEBIAN_FRONTEND noninteractive

RUN apt update

RUN addgroup --system --gid 996 libreoffice
RUN adduser --disabled-password --system --disabled-login --shell /sbin/nologin --gid 996 --uid 996 libreoffice

RUN apt -y install locales-all fontconfig libxt6 libxrender1 
RUN apt -y install libreoffice --no-install-recommends

RUN dpkg-reconfigure fontconfig && fc-cache -f -s -v

RUN for i in `seq -w 1 10` ; do mkdir -m 777 /var/tmp/soffice${i}; done

VOLUME ["/usr/share/fonts/"]
RUN chown libreoffice /home/libreoffice/

ADD ./bbb-libreoffice-entrypoint.sh /home/libreoffice/
RUN chown -R libreoffice /home/libreoffice/
RUN chmod 700 /home/libreoffice/bbb-libreoffice-entrypoint.sh

USER libreoffice

ENTRYPOINT ["/home/libreoffice/bbb-libreoffice-entrypoint.sh" ] 
