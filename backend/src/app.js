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
        const redis = req.app.locals.redis;
        const db = req.app.locals.db;

        // Сначала проверяем наличие данных в Redis
        if (redis && redis.isReady) {
            const cachedBuilds = await redis.get('mobci:builds');

            if (cachedBuilds) {
                return res.json({
                    source: 'cache',
                    builds: JSON.parse(cachedBuilds)
                });
            }
        }

        // Если кэша нет, обращаемся к MySQL
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

        // Сохраняем результат в Redis
        if (redis && redis.isReady) {
            await redis.set(
                'mobci:builds',
                JSON.stringify(rows),
                { EX: 30 }
            );
        }

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

        if (!['Android', 'iOS'].includes(platform)) {
            return res.status(400).json({
                error: 'Platform must be Android or iOS'
            });
        }

        const db = req.app.locals.db;
        const redis = req.app.locals.redis;

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

        // После добавления записи удаляем устаревший кэш
        if (redis && redis.isReady) {
            await redis.del('mobci:builds');
        }

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

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

module.exports = app;
