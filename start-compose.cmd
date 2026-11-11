
@echo off
chcp 65001 >nul

echo ========================================
echo       MOB CI - ЗАПУСК ПРОЕКТА
echo ========================================

docker compose up -d --build

if errorlevel 1 (
    echo Ошибка при запуске проекта!
    pause
    exit /b 1
)

echo.
echo Проект успешно запущен!
echo Веб-интерфейс: http://localhost
echo Adminer:       http://localhost:8081
echo.
docker compose ps

pause
