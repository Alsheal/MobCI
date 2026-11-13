const request = require('supertest');
const app = require('../src/app');

const mockDb = {
    query: jest.fn(),
    execute: jest.fn()
};

beforeEach(() => {
    jest.clearAllMocks();
    app.locals.db = mockDb;
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
        expect(mockDb.query).toHaveBeenCalledTimes(1);
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
        expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    test('GET /api/services returns infrastructure status', async () => {
        const response = await request(app).get('/api/services');

        expect([200, 503]).toContain(response.statusCode);
        expect(response.body.services).toEqual({
            backend: 'online',
            mysql: expect.any(String),
            frontend: expect.any(String),
            adminer: expect.any(String),
            nginx: expect.any(String)
        });

        expect(response.body.status).toMatch(/available|degraded/);
    });
});