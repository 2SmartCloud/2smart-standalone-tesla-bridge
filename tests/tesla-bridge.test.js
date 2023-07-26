/* eslint-disable jest/no-standalone-expect,jest/no-test-callback,jest/no-try-expect */
const Debugger                   = require('homie-sdk/lib/utils/debugger');
const { RequestInterceptor }     = require('node-request-interceptor');
const { interceptClientRequest } = require('node-request-interceptor/lib/interceptors/ClientRequest');
const createTeslaBridge          = require('../app');
const { bridge, tesla }          = require('../etc/config')[process.env.MODE || 'test'];
const vehicleProperties          = require('../etc/vehicleProperties');
const ERROR_CODES                = require('../etc/errorCodes');
const testServer                 = require('./server/server');

// eslint-disable-next-line no-magic-numbers
const PORT = bridge.testServerPort || 8000;
// eslint-disable-next-line no-magic-numbers
const TEST_TIMEOUT = process.env.TEST_TIMEOUT || 15000;

jest.setTimeout(TEST_TIMEOUT);

// eslint-disable-next-line max-lines-per-function
describe('Tesla Bridge', () => {
    let debug = null;
    let teslaBridge = null;
    let interceptor = null;
    let device = null;
    let node = null;

    // eslint-disable-next-line func-style
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    // eslint-disable-next-line func-style
    const startServer = server => new Promise(resolve => server.listen(PORT, resolve));

    beforeAll(async () => {
        debug = new Debugger(bridge.debug || '');
        interceptor = new RequestInterceptor([ interceptClientRequest ]);

        interceptor.use(req => {
            const reqBody = req.body ? JSON.parse(req.body) : {};
            const { pathname } = req.url;

            if (pathname === tesla.oauthTokenPath && reqBody.grant_type === 'password') { // check auth request
                expect(req.method).toBe('POST');
                expect(req.body).toEqual(JSON.stringify({
                    email           : tesla.email,
                    password        : tesla.password,
                    'client_id'     : tesla.clientId,
                    'client_secret' : tesla.clientSecret,
                    'grant_type'    : 'password'
                }));
            }

            if (pathname === tesla.vehiclesApiPath) { // check /api/1/vehicles request to build bridge nodes(cars)
                expect(req.method).toBe('GET');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
            }
        });

        await startServer(testServer);

        debug.initEvents();

        teslaBridge = await createTeslaBridge(debug);
        await teslaBridge.init();
        device = teslaBridge.deviceBridge.homieEntity;
        [ node ] = device.getNodes();
    });

    afterAll(async () => {
        const { homieMigrator, deviceBridge: { homieEntity } } = teslaBridge;
        interceptor.restore();
        homieMigrator.deleteDevice(homieEntity);
        // eslint-disable-next-line no-magic-numbers
        await sleep(500);
        teslaBridge.destroy();
    });

    // eslint-disable-next-line no-magic-numbers
    afterEach(() => sleep(500));

    test('Tesla Bridge inited correctly', () => {
        const nodes = device.getNodes();

        expect(device.getState()).toBe('ready');
        expect(nodes.length).toBeGreaterThanOrEqual(1);
        expect(node.getOptionById('set-temps')).toBeTruthy();
        expect(node.getOptionById('speed-limit-activate')).toBeTruthy();
        expect(node.getOptionById('speed-limit-deactivate')).toBeTruthy();
        expect(node.getOptionById('speed-limit-clear-pin')).toBeTruthy();
        expect(node.getOptionById('speed-limit')).toBeTruthy();

        expect(node.getTelemetryById('latitude')).toBeTruthy();
        expect(node.getTelemetryById('longitude')).toBeTruthy();
        expect(node.getTelemetryById('battery-level')).toBeTruthy();

        expect(node.getSensorById('wake-up')).toBeTruthy();
        expect(node.getSensorById('honk-horn')).toBeTruthy();
        expect(node.getSensorById('doors')).toBeTruthy();
        expect(node.getSensorById('software-update')).toBeTruthy();
        expect(node.getSensorById('climate-control')).toBeTruthy();
    });

    test('POSITIVE: Climate control temperature request', async done => {
        const propertyId = 'set-temps';
        const property = node.getOptionById(propertyId);
        const propertyObj = vehicleProperties.options.find(option => option.id === propertyId);
        const tempToSet = 27.3;

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.body).toEqual(JSON.stringify({
                    driver_temp    : tempToSet,
                    passenger_temp : tempToSet
                }));
                done();
            }
        });

        await property.setAttribute('value', tempToSet);
    });

    test('POSITIVE: Speed limit activate request', async done => {
        const propertyId = 'speed-limit-activate';
        const property = node.getOptionById(propertyId);
        const propertyObj = vehicleProperties.options.find(option => option.id === propertyId);
        const pinToSet = '1234';

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.body).toEqual(JSON.stringify({
                    pin : pinToSet
                }));
                done();
            }
        });

        await property.setAttribute('value', pinToSet);
    });

    test('NEGATIVE: Speed limit activate request', async () => {
        const propertyId = 'speed-limit-activate';
        const property = node.getOptionById(propertyId);
        const pinToSet = '123';

        try {
            await property.setAttribute('value', pinToSet);
            throw new Error();
        } catch (err) {
            expect(err.code).toBe(ERROR_CODES.VALIDATION);
        }
    });

    test('POSITIVE: Speed limit deactivate request', async done => {
        const propertyId = 'speed-limit-deactivate';
        const property = node.getOptionById(propertyId);
        const propertyObj = vehicleProperties.options.find(option => option.id === propertyId);
        const pinToSet = '1234';

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.body).toEqual(JSON.stringify({
                    pin : pinToSet
                }));
                done();
            }
        });

        await property.setAttribute('value', pinToSet);
    });

    test('NEGATIVE: Speed limit deactivate request', async () => {
        const propertyId = 'speed-limit-deactivate';
        const property = node.getOptionById(propertyId);
        const pinToSet = '123';

        try {
            await property.setAttribute('value', pinToSet);
            throw new Error();
        } catch (err) {
            expect(err.code).toBe(ERROR_CODES.VALIDATION);
        }
    });

    test('POSITIVE: Speed limit clear pin request', async done => {
        const propertyId = 'speed-limit-clear-pin';
        const property = node.getOptionById(propertyId);
        const propertyObj = vehicleProperties.options.find(option => option.id === propertyId);
        const pinToSet = '1234';

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.body).toEqual(JSON.stringify({
                    pin : pinToSet
                }));
                done();
            }
        });

        await property.setAttribute('value', pinToSet);
    });

    test('NEGATIVE: Speed limit clear pin request', async () => {
        const propertyId = 'speed-limit-clear-pin';
        const property = node.getOptionById(propertyId);
        const pinToSet = '123';

        try {
            await property.setAttribute('value', pinToSet);
            throw new Error();
        } catch (err) {
            expect(err.code).toBe(ERROR_CODES.VALIDATION);
        }
    });

    test('POSITIVE: Speed limit request', async done => {
        const propertyId = 'speed-limit';
        const property = node.getOptionById(propertyId);
        const propertyObj = vehicleProperties.options.find(option => option.id === propertyId);
        const limitMphToSet = 75;

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.body).toEqual(JSON.stringify({
                    limit_mph : limitMphToSet
                }));
                done();
            }
        });

        await property.setAttribute('value', limitMphToSet);
    });

    test('NEGATIVE: Speed limit request', async () => {
        const propertyId = 'speed-limit';
        const property = node.getOptionById(propertyId);
        const limitMphToSet = 91;

        try {
            await property.setAttribute('value', limitMphToSet);
            throw new Error();
        } catch (err) {
            expect(err.code).toBe(ERROR_CODES.VALIDATION);
        }
    });

    test('POSITIVE: Wake up request', async done => {
        const propertyId = 'wake-up';
        const property = node.getSensorById(propertyId);
        const propertyObj = vehicleProperties.sensors.find(option => option.id === propertyId);

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
                done();
            }
        });

        await property.setAttribute('value', 'true');
    });

    test('POSITIVE: Honk horn request', async done => {
        const propertyId = 'honk-horn';
        const property = node.getSensorById(propertyId);
        const propertyObj = vehicleProperties.sensors.find(option => option.id === propertyId);

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
                done();
            }
        });

        await property.setAttribute('value', 'true');
    });

    test('POSITIVE: Door unlock request', async done => {
        const propertyId = 'doors';
        const property = node.getSensorById(propertyId);
        const propertyObj = vehicleProperties.sensors.find(option => option.id === propertyId);

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
                done();
            }
        });

        await property.setAttribute('value', 'true');
    });

    test('POSITIVE: Door lock request', async done => {
        const propertyId = 'doors';
        const property = node.getSensorById(propertyId);
        const propertyObj = vehicleProperties.sensors.find(option => option.id === propertyId);

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath.replace('unlock', 'lock'))) {
                expect(req.method).toBe('POST');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
                done();
            }
        });

        await property.setAttribute('value', 'false');
    });

    test('POSITIVE: Software update request', async done => {
        const propertyId = 'software-update';
        const property = node.getSensorById(propertyId);
        const propertyObj = vehicleProperties.sensors.find(option => option.id === propertyId);

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
                done();
            }
        });

        await property.setAttribute('value', 'true');
    });

    test('POSITIVE: Climate control on request', async done => {
        const propertyId = 'climate-control';
        const property = node.getSensorById(propertyId);
        const propertyObj = vehicleProperties.sensors.find(option => option.id === propertyId);

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath)) {
                expect(req.method).toBe('POST');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
                done();
            }
        });

        await property.setAttribute('value', 'true');
    });

    test('POSITIVE: Climate control off request', async done => {
        const propertyId = 'climate-control';
        const property = node.getSensorById(propertyId);
        const propertyObj = vehicleProperties.sensors.find(option => option.id === propertyId);

        interceptor.use(req => {
            if (req.url.pathname.endsWith(propertyObj.commandPath.replace('start', 'stop'))) {
                expect(req.method).toBe('POST');
                expect(req.headers).toHaveProperty('authorization');
                expect(req.headers.authorization[0]).toMatch(/^Bearer \S+$/);
                done();
            }
        });

        await property.setAttribute('value', 'false');
    });
});
