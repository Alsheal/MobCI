
@echo off
if not exist .env (
        echo ERROR: .env file not found
    pause
    exit /b 1
)
for /f "usebackq tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"
chcp 65001 >nul
title MobCI - Docker Swarm Deployment

echo ==========================================
echo       MobCI - SWARM DEPLOYMENT
echo ==========================================
echo.

echo [1/4] Проверка Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker не запущен!
    pause
    exit /b 1
)

echo.
echo [2/4] Сборка шести Docker-образов...
docker compose build
if errorlevel 1 (
    echo ERROR: Ошибка сборки образов!
    pause
    exit /b 1
)

echo.
echo [3/4] Проверка Docker Swarm...
docker info --format "{{.Swarm.LocalNodeState}}" | findstr /i "active" >nul
if errorlevel 1 (
    echo Инициализация Docker Swarm...
    docker swarm init
    if errorlevel 1 (
        echo ERROR: Не удалось инициализировать Swarm!
        pause
        exit /b 1
    )
)

echo.
echo [4/4] Развертывание MobCI...
docker stack deploy --resolve-image never -c docker-stack.yml mobci
if errorlevel 1 (
    echo ERROR: Ошибка развертывания!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo       DEPLOYMENT COMPLETED
echo ==========================================
echo.
echo Веб-интерфейс: http://localhost
echo Adminer:       http://localhost:8081
echo.
echo Проверить сервисы:
echo docker stack services mobci
echo.
pause
