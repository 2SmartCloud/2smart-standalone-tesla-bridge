/* eslint-disable jest/no-mocks-import,no-param-reassign */
/* eslint-disable security/detect-possible-timing-attacks */
const http = require('http');

const oauthToken             = require('../fixtures/__mocks__/oauth-token.js');
const oauthRefreshToken      = require('../fixtures/__mocks__/oauth-refresh-token.json');
const apiV1Vehicles          = require('../fixtures/__mocks__/api-1-vehicles.json');
const wakeUp                 = require('../fixtures/__mocks__/wake-up.json');
const commandHonkHorn        = require('../fixtures/__mocks__/command-honk-horn.json');
const vehicleData            = require('../fixtures/__mocks__/vehicle-data.json');
const doorLockUnlock         = require('../fixtures/__mocks__/door-lock-unlock.json');
const scheduleSoftwareUpdate = require('../fixtures/__mocks__/scheduleSoftwareUpdate.json');
const setTemps               = require('../fixtures/__mocks__/set-temps.json');
const autoConditioningStart  = require('../fixtures/__mocks__/auto-conditioning-start.json');
const speedLimitSetLimit     = require('../fixtures/__mocks__/speed-limit-set-limit.json');

const STATUS_CODES = {
    OK                    : 200,
    UNAUTHORIZED          : 401,
    NOT_FOUND             : 404,
    METHOD_NOT_ALLOWED    : 405,
    INTERNAL_SERVER_ERROR : 500
};

const listeners = {
    '/oauth/token' : (req, res) => {
        if (req.method === 'POST') {
            const buffer = [];
            req
                .on('data', buffer.push.bind(buffer))
                .on('end', () => {
                    const data = JSON.parse(Buffer.concat(buffer));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data.grant_type === 'password' ? oauthToken : oauthRefreshToken));
                });
        } else {
            res.statusCode = STATUS_CODES.METHOD_NOT_ALLOWED;
            res.end();
        }
    },

    '/api/1/vehicles' : (req, res) => {
        if (req.method === 'GET') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(apiV1Vehicles));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.METHOD_NOT_ALLOWED;
            res.end();
        }
    },

    '/wake_up' : (req, res) => {
        if (req.method === 'POST') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(wakeUp));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    },

    '/command/honk_horn' : (req, res) => {
        if (req.method === 'POST') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(commandHonkHorn));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    },

    '/vehicle_data' : (req, res) => {
        if (req.method === 'GET') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(vehicleData));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    },

    '/door_unlock' : (req, res) => {
        if (req.method === 'POST') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(doorLockUnlock));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    },

    '/schedule_software_update' : (req, res) => {
        if (req.method === 'POST') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(scheduleSoftwareUpdate));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    },

    '/set_temps' : (req, res) => {
        if (req.method === 'POST') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(setTemps));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    },

    '/auto_conditioning_start' : (req, res) => {
        if (req.method === 'POST') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(autoConditioningStart));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    },

    '/speed_limit_set_limit' : (req, res) => {
        if (req.method === 'POST') {
            const token = req.headers.authorization.replace('Bearer ', '');

            if (token === oauthToken.access_token) {
                res
                    .writeHead(STATUS_CODES.OK, {
                        'Content-Type' : 'application/json'
                    })
                    .end(JSON.stringify(speedLimitSetLimit));
            } else {
                res.statusCode = STATUS_CODES.UNAUTHORIZED;
                res.end();
            }
        } else {
            res.statusCode = STATUS_CODES.UNAUTHORIZED;
            res.end();
        }
    }
};

const server = http.createServer((req, res) => {
    let listener;

    if (/\/api\/1\/vehicles\/\d+\/wake_up/g.test(req.url)) {
        listener = listeners['/wake_up'];
    } else if (/\/api\/1\/vehicles\/\d+\/command\/honk_horn/g.test(req.url)) {
        listener = listeners['/command/honk_horn'];
    } else if (/\/api\/1\/vehicles\/\d+\/vehicle_data/g.test(req.url)) {
        listener = listeners['/vehicle_data'];
    } else if (/\/api\/1\/vehicles\/\d+\/command\/door_(un)?lock/g.test(req.url)) {
        listener = listeners['/door_unlock'];
    } else if (/\/api\/1\/vehicles\/\d+\/command\/schedule_software_update/g.test(req.url)) {
        listener = listeners['/schedule_software_update'];
    } else if (/\/api\/1\/vehicles\/\d+\/command\/set_temps/g.test(req.url)) {
        listener = listeners['/set_temps'];
    } else if (/\/api\/1\/vehicles\/\d+\/command\/auto_conditioning_(start|stop)/g.test(req.url)) {
        listener = listeners['/auto_conditioning_start'];
    } else if (
        /\/api\/1\/vehicles\/\d+\/command\/speed_limit_(set_limit|activate|deactivate|clear_pin)/g.test(req.url)
    ) {
        listener = listeners['/speed_limit_set_limit'];
    } else {
        listener = listeners[req.url];
    }

    if (listener) {
        try {
            listener(req, res);
        } catch (err) {
            console.error(err);
            res.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
            res.end();
        }
    } else {
        res.statusCode = STATUS_CODES.NOT_FOUND;
        res.end();
    }
});

module.exports = server;
