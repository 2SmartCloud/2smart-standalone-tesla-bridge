const BaseDeviceBridge = require('homie-sdk/lib/Bridge/BaseDevice');
const BaseNodeBridge   = require('homie-sdk/lib/Bridge/BaseNode');

const NodeBridge = require('./NodeBridge');

class DeviceBridge extends BaseDeviceBridge {
    constructor(config, { debug } = {}) {
        super({
            ...config,
            transports : null,
            options    : null,
            telemetry  : null,
            nodes      : null
        }, { debug });

        this.handleConnected = this.handleConnected.bind(this);
        this.handleDisconnected = this.handleDisconnected.bind(this);

        if (config.nodes) {
            for (let node of config.nodes) {
                if (!(node instanceof BaseNodeBridge)) {
                    node = new NodeBridge({ ...node }, { debug });
                }

                this.addNode(node);
            }
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

    handleConnected() {
        this.connected = true;
    }

    handleDisconnected() {
        this.connected = false;
    }
}

module.exports = DeviceBridge;
