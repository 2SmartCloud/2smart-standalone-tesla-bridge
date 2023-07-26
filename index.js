const Debugger          = require('homie-sdk/lib/utils/debugger');
const createTeslaBridge = require('./app');
const { bridge }        = require('./etc/config')[process.env.MODE || 'development'];

const EXIT_TIMEOUT = 5000; // time to process exit on bridge init error

(async function initBridge() {
    const debug = new Debugger(bridge.debug || '');
    // init debug
    debug.initEvents();

    try {
        const teslaBridge = await createTeslaBridge(debug);

        teslaBridge.on('error', debug.error.bind(debug));
        teslaBridge.on('exit', (reason, exitCode) => {
            debug.error(reason);
            process.exit(exitCode);
        });

        const initOptions = {
            subscribeToBridgeTopics : true // allow bridge to subscribe to its bridges topics(bridges/<bridge-id>/#)
        };

        await teslaBridge.init(initOptions);
    } catch (err) {
        debug.error(err);
        setTimeout(() => process.exit(1), EXIT_TIMEOUT);
    }
}());
