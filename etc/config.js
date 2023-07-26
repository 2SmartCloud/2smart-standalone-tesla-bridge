module.exports = Object.freeze({
    development : {
        bridge : {
            deviceName                    : process.env.DEVICE_NAME,
            id                            : process.env.SERVICE_ID,
            debug                         : process.env.DEBUG,
            syncIntervalTime              : 600000,
            refreshTokenIntervalTime      : 2147483647, // max integer allowed by Node.js timers
            refreshTokenErrorIntervalTime : 120000 // 2 mins in msecs
        },
        mqtt : {
            username : process.env.MQTT_USER,
            password : process.env.MQTT_PASS,
            uri      : process.env.MQTT_URI
        },
        tesla : {
            clientId        : process.env.CLIENT_ID,
            clientSecret    : process.env.CLIENT_SECRET,
            accessToken     : process.env.OAUTH_ACCESS_TOKEN,
            refreshToken    : process.env.OAUTH_REFRESH_TOKEN,
            baseUrl         : 'http://localhost:8000',
            oauthTokenPath  : '/oauth/token',
            vehiclesApiPath : '/api/1/vehicles',
            vehicleDataPath : '/vehicle_data'
        }
    },
    test : {
        bridge : {
            deviceName                    : process.env.DEVICE_NAME,
            id                            : process.env.SERVICE_ID,
            debug                         : process.env.DEBUG,
            syncIntervalTime              : 600000,
            refreshTokenIntervalTime      : 2147483647, // max integer allowed by Node.js timers
            refreshTokenErrorIntervalTime : 120000, // 2 mins in msecs
            testServerPort                : process.env.TEST_SERVER_PORT
        },
        mqtt : {
            username : process.env.MQTT_USER,
            password : process.env.MQTT_PASS,
            uri      : process.env.MQTT_URI
        },
        tesla : {
            clientId        : process.env.CLIENT_ID,
            clientSecret    : process.env.CLIENT_SECRET,
            accessToken     : process.env.OAUTH_ACCESS_TOKEN,
            refreshToken    : process.env.OAUTH_REFRESH_TOKEN,
            baseUrl         : 'http://localhost:8000',
            oauthTokenPath  : '/oauth/token',
            vehiclesApiPath : '/api/1/vehicles',
            vehicleDataPath : '/vehicle_data'
        }
    },
    production : {
        bridge : {
            deviceName                    : process.env.DEVICE_NAME,
            id                            : process.env.SERVICE_ID,
            debug                         : process.env.DEBUG,
            syncIntervalTime              : 600000,
            refreshTokenIntervalTime      : 2147483647, // max integer allowed by Node.js timers
            refreshTokenErrorIntervalTime : 120000 // 2 mins in msecs
        },
        mqtt : {
            username : process.env.MQTT_USER,
            password : process.env.MQTT_PASS,
            uri      : process.env.MQTT_URI
        },
        tesla : {
            clientId        : process.env.CLIENT_ID,
            clientSecret    : process.env.CLIENT_SECRET,
            accessToken     : process.env.OAUTH_ACCESS_TOKEN,
            refreshToken    : process.env.OAUTH_REFRESH_TOKEN,
            baseUrl         : 'https://owner-api.teslamotors.com',
            oauthTokenPath  : '/oauth/token',
            vehiclesApiPath : '/api/1/vehicles',
            vehicleDataPath : '/vehicle_data'
        }
    }
});
