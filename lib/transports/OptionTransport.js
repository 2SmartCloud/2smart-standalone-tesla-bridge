const BaseTransport = require('homie-sdk/lib/Bridge/BasePropertyTransport');

class OptionTransport extends BaseTransport {
    constructor(config) {
        super({ ...config, pollInterval: 0 });
        this.handleConnected = this.handleConnected.bind(this);
    }

    attachBridge(bridge) {
        super.attachBridge(bridge);
        this.debug = bridge.debug;
        this.bridge.transport.once('connect', this.handleConnected);
    }

    handleConnected() {
        // TODO: implement this method
    }
}

module.exports = OptionTransport;
