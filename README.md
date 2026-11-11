# MobCI

Учебный проект по настройке и администрированию CI/CD-процесса для мобильного приложения.

## 1. Назначение проекта

MobCI — демонстрационная система автоматизации тестирования, сборки и контроля качества программного обеспечения. Проект объединяет контейнеризированную инфраструктуру, серверную часть, базу данных, кэширование и автоматизированную сборку Android-приложения.

## 2. Архитектура проекта

Основная инфраструктура состоит из шести отдельных Docker Compose сервисов:

1. **adminer** — веб-интерфейс управления базой данных.
2. **backend** — серверная часть на Node.js и Express.
3. **cache** — кэширование данных с помощью Redis.
4. **db** — хранение данных в MySQL.
5. **frontend** — пользовательский веб-интерфейс.
6. **proxy** — маршрутизация запросов через Nginx.

Jenkins работает отдельно от Docker Compose и выполняет CI/CD Pipeline. Для сборки Android используется установленный в Jenkins Android SDK и Gradle.

## 3. Используемые технологии

- Docker и Docker Compose
- Jenkins
- Node.js 20
- Express
- MySQL
- Redis
- Nginx
- Adminer
- Kotlin
- Android SDK
- Gradle 8.9
- JUnit

## 4. Структура проекта

```text
MobCI_container_edition/
├── adminer/
├── backend/
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   └── Dockerfile.ci
├── cache/
├── db/
├── frontend/
├── proxy/
├── mobile/
│   └── android-demo/
│       ├── app/
│       │   └── src/
│       ├── build.gradle
│       ├── settings.gradle
│       └── gradle.properties
├── docker-compose.yml
├── docker-stack.yml
├── Jenkinsfile
├── README.md
├── start-compose.cmd
└── stop-all.cmd
```

## 5. Запуск инфраструктуры

Требования:
- Windows 10/11
- Docker Desktop с запущенным Docker Engine
- Docker Compose

Для запуска проекта выполните:

```cmd
docker compose up -d --build
```

Или запустите файл:

```cmd
start-compose.cmd
```

Проверка состояния сервисов:

```cmd
docker compose ps
```

Остановка проекта:

```cmd
docker compose down
```

Либо:

```cmd
stop-all.cmd
```

## 6. Доступ к сервисам

| Компонент | Адрес |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost/api/health |
| История сборок | http://localhost/api/builds |
| Adminer | http://localhost:8081 |

## 7. Backend и база данных

Backend предоставляет API для получения и регистрации информации о сборках.

Используются:
- MySQL для хранения истории сборок;
- Redis для кэширования;
- Express для обработки HTTP-запросов.

Для локального запуска тестов:

```cmd
cd backend
npm install
npm test
```

## 8. Android-приложение

В каталоге `mobile/android-demo` находится демонстрационное Android-приложение на Kotlin.

Приложение содержит:
- MainActivity;
- AndroidManifest.xml;
- конфигурацию Gradle;
- модульные тесты JUnit.

Параметры Android-сборки:
- compileSdk: 35
- minSdk: 23
- targetSdk: 35
- Java: 17
- Kotlin: 2.0.21
- Gradle: 8.9

## 9. Jenkins CI/CD Pipeline

Jenkins выполняет пять этапов автоматизации:

1. **Check environment** — проверка структуры проекта, окружения и Docker.
2. **Backend tests** — сборка тестового образа и запуск автоматизированных тестов backend.
3. **Build Docker images** — сборка образов шести сервисов.
4. **Android tests and APK build** — запуск модульных тестов Android и сборка APK.
5. **Smoke tests** — проверка доступности веб-интерфейса и Backend API.

Конфигурация Pipeline находится в файле `Jenkinsfile`.

В текущей демонстрационной конфигурации Jenkins Pipeline использует отдельный Jenkins-контейнер и рабочий каталог `/workspace`.

## 10. Результат Android-сборки

После успешного выполнения Pipeline APK сохраняется в Jenkins как артефакт:

```text
mobile-artifacts/app-debug.apk
```

Файл можно скачать из раздела Build Artifacts соответствующей сборки Jenkins.

Локальный результат сборки:

```text
mobile/android-demo/app/build/outputs/apk/debug/app-debug.apk
```

Демонстрационный APK также был скопирован в:

```text
%USERPROFILE%\Desktop\MobCI-app-debug.apk
```

## 11. Проверка результатов

В ходе проверки проекта были выполнены:

- сборка Docker-образов шести сервисов;
- запуск Docker Compose;
- проверка состояния контейнеров;
- проверка Backend API;
- проверка соединения с MySQL и Redis;
- запуск автоматизированных backend-тестов;
- запуск Android unit-тестов;
- сборка Android APK;
- успешный запуск Jenkins Pipeline;
- архивирование APK в Jenkins;
- проверка целостности APK;
- копирование APK из Jenkins на Windows.

Последняя проверенная сборка Jenkins завершилась со статусом SUCCESS.

## 12. Ограничения проекта

Проект демонстрирует CI/CD-процесс для Android-приложения. Сборка APK реализована и проверена.

Сборка iOS-приложения IPA не реализована. Для неё требуется macOS с Xcode. Публикация приложения в Google Play также не входит в текущую реализацию.

Проект предназначен для учебной демонстрации. Перед использованием в производственной среде необходимо настроить безопасное хранение паролей, учётных данных и секретов.
