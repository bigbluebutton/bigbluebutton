FROM nginx

RUN apt-get update && apt-get install -y wget

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY ./nginx.conf.tmpl /etc/nginx/nginx.conf.tmpl

CMD [ "dockerize", \
  "-template", "/etc/nginx/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
  "nginx", "-g", "daemon off;" ]
