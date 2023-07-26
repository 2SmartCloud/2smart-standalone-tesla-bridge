FROM node:12.18.3-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache tzdata git

WORKDIR /app

COPY package.json package.json
COPY app.js app.js
COPY etc/ etc/
COPY lib/ lib/
COPY index.js index.js

ENV MODE production

RUN npm i --production

CMD [ "npm", "start" ]
