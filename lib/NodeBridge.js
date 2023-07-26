const fetch              = require('node-fetch');
const pointer            = require('jsonpointer');
const BaseNodeBridge     = require('homie-sdk/lib/Bridge/BaseNode');
const BasePropertyBridge = require('homie-sdk/lib/Bridge/BaseProperty');

const STATUS_CODES = require('../etc/statusCodes');

const Transport = require('./transports/Transport');

class NodeBridge extends BaseNodeBridge {
    constructor(config, { debug } = {}) {
        super({
            ...config,
            transports : null,
            options    : null,
            telemetry  : null,
            sensors    : null
        }, { debug });

        this.vehiclesApiPath             = config.vehiclesApiPath;
        this.vehicleDataPath             = config.vehicleDataPath;
        this.syncIntervalTime            = config.syncIntervalTime;
        this.handleConnected             = this.handleConnected.bind(this);
        this.handleDisconnected          = this.handleDisconnected.bind(this);
        this.syncOptionsAndTelemetryData = this.syncOptionsAndTelemetryData.bind(this);
        this.syncInterval                = null;

        if (config.options) {
            for (let option of config.options) {
                if (!(option instanceof BasePropertyBridge)) {
                    const { vehicleStateDataResponsePointer } = option;

                    option = new BasePropertyBridge(option, {
                        type      : 'option',
                        transport : new Transport({
                            id              : option.name,
                            vehicleId       : this.id,
                            commandPath     : option.commandPath,
                            actionFn        : option.actionFn,
                            vehiclesApiPath : this.vehiclesApiPath
                        })
                    });

                    option.vehicleStateDataResponsePointer = vehicleStateDataResponsePointer;
                }

                this.addOption(option);
            }
        }

        if (config.telemetry) {
            for (let telemetry of config.telemetry) {
                if (!(telemetry instanceof BasePropertyBridge)) {
                    const { vehicleStateDataResponsePointer } = telemetry;

                    telemetry = new BasePropertyBridge(telemetry, {
                        type      : 'telemetry',
                        transport : new Transport({
                            id              : telemetry.name,
                            vehicleId       : this.id,
                            commandPath     : telemetry.commandPath,
                            actionFn        : telemetry.actionFn,
                            vehiclesApiPath : this.vehiclesApiPath
                        })
                    });

                    telemetry.vehicleStateDataResponsePointer = vehicleStateDataResponsePointer;
                }

                this.addTelemetry(telemetry);
            }
        }

        if (config.sensors) {
            for (let sensor of config.sensors) {
                if (!(sensor instanceof BasePropertyBridge)) {
                    sensor = new BasePropertyBridge(sensor, {
                        type      : 'sensor',
                        transport : new Transport({
                            id              : sensor.name,
                            vehicleId       : this.id,
                            commandPath     : sensor.commandPath,
                            actionFn        : sensor.actionFn,
                            vehiclesApiPath : this.vehiclesApiPath
                        })
                    });
                }

                this.addSensor(sensor);
            }
        }
    }

    async init() {
        this.vehicleDataUrl = `${this.bridge.baseUrl}${this.vehiclesApiPath}/${this.id}${this.vehicleDataPath}`;
        this.debug = this.bridge.debug;
        await this.syncOptionsAndTelemetryData();
        this.syncInterval = setInterval(this.syncOptionsAndTelemetryData, this.syncIntervalTime);
    }

    async syncOptionsAndTelemetryData() {
        const res = await fetch(this.vehicleDataUrl, {
            method  : 'GET',
            headers : {
                Authorization : `Bearer ${this.bridge.getToken()}`
            }
        });

        if (res.status === STATUS_CODES.OK) {
            const resBody = await res.json();

            this.options.forEach(option => {
                if (option.vehicleStateDataResponsePointer) {
                    const newValue = pointer.get(resBody, option.vehicleStateDataResponsePointer);
                    option.publishAttribute('value', newValue);
                }
            });

            this.telemetry.forEach(telemetry => {
                if (telemetry.vehicleStateDataResponsePointer) {
                    const newValue = pointer.get(resBody, telemetry.vehicleStateDataResponsePointer);
                    telemetry.publishAttribute('value', newValue);
                }
            });
        } else {
            this.debug.warning('NodeBridge.syncOptionsAndTelemetryData', 'Error with /vehicle_data request');
        }
    }

    attachBridge(bridge) {
        super.attachBridge(bridge);
        this.bridge.transport.on('connect', this.handleConnected);
        this.bridge.transport.on('disconnect', this.handleDisconnected);
    }

    detachBridge() {
        this.bridge.transport.off('connect', this.handleConnected);
        this.bridge.transport.off('disconnect', this.handleDisconnected);
        super.detachBridge();
    }

    async handleConnected() {
        this.connected = true;
        await this.init();
    }

    handleDisconnected() {
        this.connected = false;
        clearInterval(this.syncInterval);
    }
}

module.exports = NodeBridge;
