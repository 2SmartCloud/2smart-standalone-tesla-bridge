const X                       = require('homie-sdk/lib/utils/X');
const fetch                   = require('node-fetch');
const TeslaBridge             = require('./lib');
const { tesla, bridge, mqtt } = require('./etc/config')[process.env.MODE || 'development'];
const STATUS_CODES            = require('./etc/statusCodes');
const ERROR_CODES             = require('./etc/errorCodes');
const vehicleProperties       = require('./etc/vehicleProperties');

const TESLA_CAR_STATES_TO_HOMIE_STATES = { // mapping of tesla API car states to homie device states
    online : 'ready'
};

module.exports = async function createTeslaBridge(debug) {
    const vehiclesListUrl = `${tesla.baseUrl}${tesla.vehiclesApiPath}`;

    const vehiclesListRes = await fetch(vehiclesListUrl, {
        method  : 'GET',
        headers : {
            'Authorization' : `Bearer ${tesla.accessToken}`
        }
    });

    if (vehiclesListRes.status !== STATUS_CODES.OK) {
        throw new X({
            message : '/api/1/vehicles request error',
            code    : ERROR_CODES.REQUEST_ERROR,
            fields  : {}
        });
    }

    const { response: vehicles } = await vehiclesListRes.json();

    const device = {
        id   : mqtt.username || 'tesla-bridge',
        name : bridge.deviceName
    };

    device.nodes = vehicles.reduce((arr, vehicle) => {
        arr.push({
            id               : vehicle.id,
            name             : vehicle.display_name,
            vehiclesApiPath  : tesla.vehiclesApiPath,
            vehicleDataPath  : tesla.vehicleDataPath,
            syncIntervalTime : bridge.syncIntervalTime,
            state            : TESLA_CAR_STATES_TO_HOMIE_STATES[vehicle.state] || 'lost',
            ...vehicleProperties
        });

        return arr;
    }, []);

    const teslaBridgeConf = {
        bridgeId                      : bridge.id,
        mqttConnection                : mqtt,
        baseUrl                       : tesla.baseUrl,
        token                         : tesla.accessToken,
        refreshToken                  : tesla.refreshToken,
        oauthTokenPath                : tesla.oauthTokenPath,
        clientId                      : tesla.clientId,
        clientSecret                  : tesla.clientSecret,
        refreshTokenIntervalTime      : bridge.refreshTokenIntervalTime,
        refreshTokenErrorIntervalTime : bridge.refreshTokenErrorIntervalTime,
        device
    };

    return new TeslaBridge({ ...teslaBridgeConf, debug });
};
