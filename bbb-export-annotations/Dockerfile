FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-progress --omit=dev
COPY . .

FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f

# cairosvg and ghostscript as the package depends on; pdftocairo is set in config/settings.json
RUN apk add --no-cache py3-cairosvg ghostscript poppler-utils \
 && addgroup -S -g 998 bigbluebutton && adduser -S -u 998 -G bigbluebutton bigbluebutton

COPY --from=fonts . /usr/local/share/fonts/
COPY --from=slides blank* /usr/share/bigbluebutton/blank/
WORKDIR /usr/local/bigbluebutton/bbb-export-annotations
COPY --from=build /app ./

# Deployments mount /etc/bigbluebutton/bbb-export-annotations.json
ENV NODE_ENV=production
USER bigbluebutton
CMD ["node", "master.js"]
