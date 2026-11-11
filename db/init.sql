CREATE TABLE IF NOT EXISTS builds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform ENUM('Android', 'iOS') NOT NULL,
    app_version VARCHAR(50) NOT NULL,
    status ENUM('running', 'passed', 'failed') NOT NULL DEFAULT 'running',
    commit_sha VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_builds_platform
ON builds(platform);
CREATE INDEX idx_builds_status
ON builds(status);
INSERT INTO builds (
    platform,
    app_version,
    status,
    commit_sha
)
VALUES
    ('Android', '1.0.0', 'passed', 'demo001'),
    ('iOS', '1.0.0', 'running', 'demo002');
