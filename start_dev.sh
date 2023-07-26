#!/bin/sh

# start mocker Tesla API server
npm run test-server &
# wait for server start
while ! nc -z localhost $PORT; do sleep 0.1; done;
# start app
npm start
