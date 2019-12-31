FROM nginx

RUN mkdir /etc/bigbluebutton

COPY ./ssl /etc/ssl

COPY ./bigbluebutton /etc/nginx/sites-enabled/bigbluebutton
COPY ./nginx /etc/bigbluebutton/nginx
COPY ./nginx.conf /etc/nginx/nginx.conf

COPY docker-entrypoint.sh /sbin/docker-entrypoint.sh

ENTRYPOINT ["./sbin/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]