FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm install --production

COPY . .

RUN addgroup -g 998 bigbluebutton&& \
    adduser -u 998 -G bigbluebutton -D bigbluebutton

USER bigbluebutton

CMD [ "npm", "start" ]
