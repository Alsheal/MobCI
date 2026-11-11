
const request = require('supertest');
const app = require('../src/app');

const mockDb = {
    query: jest.fn(),
    execute: jest.fn()
};

const mockRedis = {
    isReady: true,
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
};

beforeEach(() => {
    jest.clearAllMocks();

    app.locals.db = mockDb;
    app.locals.redis = mockRedis;

    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.del.mockResolvedValue(1);
});

describe('MobCI API tests', () => {
    test('GET /health returns 200', async () => {
        const response = await request(app).get('/health');

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    test('GET /api/health returns available status', async () => {
        const response = await request(app).get('/api/health');

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('available');
    });

    test('GET /api/builds loads data from MySQL', async () => {
        mockDb.query.mockResolvedValue([[
            {
                id: 1,
                platform: 'Android',
                version: '1.0.0',
                status: 'passed'
            }
        ]]);

        const response = await request(app).get('/api/builds');

        expect(response.statusCode).toBe(200);
        expect(response.body.source).toBe('database');
        expect(response.body.builds).toHaveLength(1);
    });

    test('GET /api/builds uses Redis cache', async () => {
        mockRedis.get.mockResolvedValue(JSON.stringify([
            {
                id: 1,
                platform: 'Android',
                version: '1.0.0',
                status: 'passed'
            }
        ]));

        const response = await request(app).get('/api/builds');

        expect(response.statusCode).toBe(200);
        expect(response.body.source).toBe('cache');
        expect(mockDb.query).not.toHaveBeenCalled();
    });

    test('POST /api/builds rejects invalid platform', async () => {
        const response = await request(app)
            .post('/api/builds')
            .send({ platform: 'Windows' });

        expect(response.statusCode).toBe(400);
    });

    test('POST /api/builds creates Android record', async () => {
        mockDb.execute.mockResolvedValue([{ insertId: 10 }]);

        const response = await request(app)
            .post('/api/builds')
            .send({
                platform: 'Android',
                version: '1.0.1',
                commit: 'test123'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.build.id).toBe(10);
        expect(response.body.build.platform).toBe('Android');
        expect(mockRedis.del).toHaveBeenCalledWith('mobci:builds');
    });
});
