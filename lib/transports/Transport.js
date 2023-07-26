const BaseTransport = require('homie-sdk/lib/Bridge/BasePropertyTransport');

class Transport extends BaseTransport {
    constructor({
        id,
        vehicleId,
        commandPath,
        actionFn = null,
        vehiclesApiPath
    }) {
        super({ id, pollInterval: 0 });
        this.handleConnected = this.handleConnected.bind(this);
        this.commandPath     = commandPath;
        this.actionFn        = actionFn ? actionFn.bind(this) : null;
        this.vehicleId       = vehicleId;
        this.vehiclesApiPath = vehiclesApiPath;
    }

    async set(data) {
        if (this.actionFn) await this.actionFn(data);

        return super.set(data);
    }

    attachBridge(bridge) {
        super.attachBridge(bridge);
        this.debug = bridge.debug;
        this.bridge.transport.once('connect', this.handleConnected);
    }

    getToken() {
        return this.bridge.getToken();
    }

    handleConnected() {
        this.commandUrl = `${this.bridge.baseUrl}${this.vehiclesApiPath}/${this.vehicleId}${this.commandPath}`;
    }
}

module.exports = Transport;
