const BaseBridge = require('homie-sdk/lib/Bridge/Base');
const fetch      = require('node-fetch');

const STATUS_CODES = require('../etc/statusCodes');
const DeviceBridge = require('./DeviceBridge');

class TeslaBridge extends BaseBridge {
    constructor(config) {
        super({ ...config, device: null });
        this.bridgeId                      = config.bridgeId;
        this.transport                     = this.homie.transport;
        this.baseUrl                       = config.baseUrl;
        this.oauthTokenPath                = config.oauthTokenPath;
        this.token                         = config.token;
        this.refreshToken                  = config.refreshToken;
        this.clientId                      = config.clientId;
        this.clientSecret                  = config.clientSecret;
        this.refreshTokenIntervalTime      = config.refreshTokenIntervalTime;
        this.refreshTokenErrorIntervalTime = config.refreshTokenErrorIntervalTime;
        this.refreshTokenInterval          = null;
        this.doRefreshToken                = this.doRefreshToken.bind(this);
        this.setDeviceBridge(new DeviceBridge({ ...config.device }, { debug: config.debug }));
    }

    async doRefreshToken() {
        try {
            const res = await fetch(`${this.baseUrl}${this.oauthTokenPath}`, {
                method : 'POST',
                body   : JSON.stringify({
                    client_id     : this.clientId,
                    client_secret : this.clientSecret,
                    grant_type    : 'refresh_token',
                    refresh_token : this.refreshToken
                }),
                headers : {
                    'Content-Type' : 'application/json'
                }
            });

            if (res.status === STATUS_CODES.OK) {
                const resBody = await res.json();
                this.token = resBody.access_token;
                this.refreshToken = resBody.refresh_token;

                const bridge = this.homie.getEntityById('BRIDGE', this.bridgeId);
                const prevConfig = bridge.configuration;
                const newConfig = {
                    ...prevConfig,
                    OAUTH_ACCESS_TOKEN  : this.token,
                    OAUTH_REFRESH_TOKEN : this.refreshToken
                };

                await bridge.publish({ configuration: newConfig }, true);

                // if device was disconnected after first try to retrieve new access token
                if (!this.deviceBridge.connected) {
                    this.transport.emit('connect');
                }
            } else {
                this.debug.warning(
                    'TeslaBridge.doRefreshToken',
                    `Error with retrieving new access token. Try again in ${this.refreshTokenIntervalTime} ms`
                );
                // disconnect the device until success retrieving of a new access token
                // eslint-disable-next-line more/no-duplicated-chains
                if (this.deviceBridge.connected) this.transport.emit('disconnect');
                // recursive call for the next try to retrieve access token
                setTimeout(this.doRefreshToken, this.refreshTokenErrorIntervalTime);
            }
        } catch (err) {
            this.debug.warning('TeslaBridge.doRefreshToken', err);
        }
    }

    getToken() {
        return this.token;
    }

    async init(options) {
        this.debug.info('TeslaBridge.init', 'start');
        await super.init(options);
        this.refreshTokenInterval = setInterval(this.doRefreshToken, this.refreshTokenIntervalTime);
        this.debug.info('TeslaBridge.init', 'finish');
    }

    destroy() {
        clearInterval(this.refreshTokenInterval);
        super.destroy();
    }
}

module.exports = TeslaBridge;
