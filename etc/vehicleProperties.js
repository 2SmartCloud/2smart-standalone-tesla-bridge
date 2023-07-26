const fetch = require('node-fetch');
const X     = require('homie-sdk/lib/utils/X');

const STATUS_CODES = require('../etc/statusCodes');
const ERROR_CODES  = require('../etc/errorCodes');

module.exports = {
    options : [
        {
            id                              : 'set-temps',
            name                            : 'Climate control temperature',
            dataType                        : 'float',
            settable                        : 'true',
            retained                        : 'true',
            commandPath                     : '/command/set_temps',
            vehicleStateDataResponsePointer : '/response/climate_state/driver_temp_setting',
            unit                            : '°C',
            async actionFn(value) {
                const res = await fetch(this.commandUrl, {
                    method : 'POST',
                    body   : JSON.stringify({
                        driver_temp    : parseFloat(value),
                        passenger_temp : parseFloat(value)
                    }),
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : 'Error with /command/set_temps request',
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        },
        {
            id          : 'speed-limit-activate',
            name        : 'Speed limit activate',
            dataType    : 'string',
            settable    : 'true',
            retained    : 'true',
            commandPath : '/command/speed_limit_activate',
            async actionFn(value) {
                if (!/^\d{4}$/.test(value)) {
                    throw new X({
                        message : 'Pin must be 4 digit number(e.g. 1234)',
                        code    : ERROR_CODES.VALIDATION,
                        fields  : {}
                    });
                }

                const res = await fetch(this.commandUrl, {
                    method : 'POST',
                    body   : JSON.stringify({
                        pin : value
                    }),
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : 'Error with /command/speed_limit_activate request',
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        },
        {
            id          : 'speed-limit-deactivate',
            name        : 'Speed limit deactivate',
            dataType    : 'string',
            settable    : 'true',
            retained    : 'true',
            commandPath : '/command/speed_limit_deactivate',
            async actionFn(value) {
                if (!/^\d{4}$/.test(value)) {
                    throw new X({
                        message : 'Pin must be 4 digit number(e.g. 1234)',
                        code    : ERROR_CODES.VALIDATION,
                        fields  : {}
                    });
                }

                const res = await fetch(this.commandUrl, {
                    method : 'POST',
                    body   : JSON.stringify({
                        pin : value
                    }),
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : 'Error with /command/speed_limit_deactivate request',
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        },
        {
            id          : 'speed-limit-clear-pin',
            name        : 'Speed limit clear pin',
            dataType    : 'string',
            settable    : 'true',
            retained    : 'true',
            commandPath : '/command/speed_limit_clear_pin',
            async actionFn(value) {
                if (!/^\d{4}$/.test(value)) {
                    throw new X({
                        message : 'Pin must be 4 digit number(e.g. 1234)',
                        code    : ERROR_CODES.VALIDATION,
                        fields  : {}
                    });
                }

                const res = await fetch(this.commandUrl, {
                    method : 'POST',
                    body   : JSON.stringify({
                        pin : value
                    }),
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : 'Error with /command/speed_limit_clear_pin request',
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        },
        {
            id                              : 'speed-limit',
            name                            : 'Speed limit(50-90 m/h)',
            dataType                        : 'integer',
            settable                        : 'true',
            retained                        : 'true',
            vehicleStateDataResponsePointer : '/response/vehicle_state/speed_limit_mode/current_limit_mph',
            commandPath                     : '/command/speed_limit_set_limit',
            unit                            : 'm/h',
            async actionFn(value) {
                const mph = parseInt(value, 10);

                // eslint-disable-next-line no-magic-numbers
                if (mph < 50 || mph > 90) {
                    throw new X({
                        message : 'Speed limit value must be in range 50-90 mph',
                        code    : ERROR_CODES.VALIDATION,
                        fields  : {}
                    });
                }

                const res = await fetch(this.commandUrl, {
                    method : 'POST',
                    body   : JSON.stringify({
                        limit_mph : mph
                    }),
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : 'Error with /command/speed_limit_set_limit request',
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        }
    ],
    telemetry : [
        {
            id                              : 'latitude',
            name                            : 'Latitude',
            dataType                        : 'float',
            settable                        : 'false',
            retained                        : 'true',
            vehicleStateDataResponsePointer : '/response/drive_state/latitude'
        },
        {
            id                              : 'longitude',
            name                            : 'Longitude',
            dataType                        : 'float',
            settable                        : 'false',
            retained                        : 'true',
            vehicleStateDataResponsePointer : '/response/drive_state/longitude'
        },
        {
            id                              : 'battery-level',
            name                            : 'Battery level',
            dataType                        : 'integer',
            settable                        : 'false',
            retained                        : 'true',
            unit                            : '%',
            vehicleStateDataResponsePointer : '/response/charge_state/battery_level'
        }
    ],
    sensors : [
        {
            id          : 'wake-up',
            name        : 'Wake up',
            dataType    : 'boolean',
            settable    : 'true',
            retained    : 'false',
            commandPath : '/wake_up',
            actionFn() {
                return new Promise((resolve, reject) => {
                    const timeoutTime = 18000;

                    let fn = async () => {
                        const res = await fetch(this.commandUrl, {
                            method  : 'POST',
                            headers : {
                                Authorization : `Bearer ${this.getToken()}`
                            }
                        });

                        if (res.status !== STATUS_CODES.OK) return reject();

                        const resBody = await res.json();

                        if (resBody.response && resBody.response.state === 'online') {
                            return resolve();
                        }

                        if (fn) await fn();
                    };

                    setTimeout(() => {
                        fn = null;

                        reject(new X({
                            code   : ERROR_CODES.TIMEOUT,
                            fields : {}
                        }));
                    }, timeoutTime);

                    fn();
                });
            }
        },
        {
            id          : 'honk-horn',
            name        : 'Honk horn',
            dataType    : 'boolean',
            settable    : 'true',
            retained    : 'false',
            commandPath : '/command/honk_horn',
            async actionFn() {
                const res = await fetch(this.commandUrl, {
                    method  : 'POST',
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : 'Error with /command/honk_horn request',
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        },
        {
            id          : 'doors',
            name        : 'Door unlock',
            dataType    : 'boolean',
            settable    : 'true',
            retained    : 'true',
            commandPath : '/command/door_unlock',
            async actionFn(value) {
                const commandUrl = value === 'true' ?
                    this.commandUrl :
                    this.commandUrl.replace('door_unlock', 'door_lock');

                const res = await fetch(commandUrl, {
                    method  : 'POST',
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : `Error with ${commandUrl} request`,
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        },
        {
            id          : 'software-update',
            name        : 'Start software update',
            dataType    : 'boolean',
            settable    : 'true',
            retained    : 'false',
            commandPath : '/command/schedule_software_update',
            async actionFn() {
                const res = await fetch(this.commandUrl, {
                    method : 'POST',
                    body   : JSON.stringify({
                        offset_sec : 0 // immediate start updating
                    }),
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : 'Error with /command/schedule_software_update request',
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        },
        {
            id          : 'climate-control',
            name        : 'Climate control',
            dataType    : 'boolean',
            settable    : 'true',
            retained    : 'true',
            commandPath : '/command/auto_conditioning_start',
            async actionFn(value) {
                const commandUrl = value === 'true' ?
                    this.commandUrl :
                    this.commandUrl.replace('start', 'stop');

                const res = await fetch(commandUrl, {
                    method  : 'POST',
                    headers : {
                        Authorization : `Bearer ${this.getToken()}`
                    }
                });

                if (res.status !== STATUS_CODES.OK) {
                    throw new X({
                        message : `Error with ${commandUrl} request`,
                        code    : ERROR_CODES.REQUEST_ERROR,
                        fields  : {}
                    });
                }
            }
        }
    ]
};
