
const express = require('express');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'mobci-backend'
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'available',
        message: 'MobCI backend is running'
    });
});

// Получение истории запусков из MySQL
app.get('/api/builds', async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [rows] = await db.query(`
            SELECT
                id,
                platform,
                app_version AS version,
                status,
                commit_sha AS commit,
                created_at AS createdAt
            FROM builds
            ORDER BY created_at DESC
        `);

        res.json({
            source: 'database',
            builds: rows
        });

    } catch (error) {
        console.error('Build history error:', error.message);

        res.status(500).json({
            error: 'Unable to load build history'
        });
    }
});

// Создание записи о запуске
app.post('/api/builds', async (req, res) => {
    try {
        const { platform } = req.body;
        const version = req.body.version || req.body.app_version;
        const commit = req.body.commit || req.body.commit_sha;

        if (platform !== 'Android') {
            return res.status(400).json({
                error: 'Platform must be Android'
            });
        }

        const db = req.app.locals.db;

        const [result] = await db.execute(
            `INSERT INTO builds
            (platform, app_version, status, commit_sha)
            VALUES (?, ?, ?, ?)`,
            [
                platform,
                version || '1.0.0',
                'running',
                commit || 'unknown'
            ]
        );

        res.status(201).json({
            message: 'Build record created',
            build: {
                id: result.insertId,
                platform,
                version: version || '1.0.0',
                status: 'running',
                commit: commit || 'unknown'
            }
        });

    } catch (error) {
        console.error('Build creation error:', error.message);

        res.status(500).json({
            error: 'Unable to create build record'
        });
    }
});

// Проверка доступности сервисов MobCI
app.get('/api/services', async (req, res) => {
    const checkHttp = async (url) => {
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(3000)
            });

            return response.ok ? 'online' : 'offline';
        } catch {
            return 'offline';
        }
    };

    const checkDatabase = async () => {
        try {
            await req.app.locals.db.query('SELECT 1');
            return 'online';
        } catch {
            return 'offline';
        }
    };

    const services = await Promise.all([
        checkDatabase(),
        checkHttp('http://frontend/'),
        checkHttp('http://adminer:8080/'),
        checkHttp('http://proxy/')
    ]);

    const result = {
        backend: 'online',
        mysql: services[0],
        frontend: services[1],
        adminer: services[2],
        nginx: services[3]
    };

    const allOnline = Object.values(result).every(
        status => status === 'online'
    );

    res.status(allOnline ? 200 : 503).json({
        status: allOnline ? 'available' : 'degraded',
        services: result,
        checkedAt: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

module.exports = app;
