
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Check environment') {
            steps {
                sh '''
                    echo "Checking MobCI workspace..."
                    test -f /workspace/docker-compose.yml
                    test -f /workspace/backend/package.json
                    test -f /workspace/mobile/android-demo/app/build.gradle
                    docker version
                    echo "Workspace and Docker are available."
                '''
            }
        }

        stage('Backend tests') {
            steps {
                sh '''
                    set -e
                    docker build -f /workspace/backend/Dockerfile.ci \
                        -t mobci-backend-test:latest \
                        /workspace/backend

                    docker run --rm mobci-backend-test:latest
                '''
            }
        }

        stage('Build Docker images') {
            steps {
                sh '''
                    set -e
                    docker build -t mobci-adminer:latest /workspace/adminer
                    docker build -t mobci-backend:latest /workspace/backend
                    docker build -t mobci-cache:latest /workspace/cache
                    docker build -t mobci-db:latest /workspace/db
                    docker build -t mobci-frontend:latest /workspace/frontend
                    docker build -t mobci-proxy:latest /workspace/proxy
                '''
            }
        }

        stage('Android tests and APK build') {
            steps {
                sh '''
                    set -e
                    cd /workspace/mobile/android-demo

                    export ANDROID_HOME=/var/jenkins_home/android-sdk
                    export ANDROID_SDK_ROOT=/var/jenkins_home/android-sdk
                    export PATH=/var/jenkins_home/gradle/gradle-8.9/bin:/var/jenkins_home/android-sdk/platform-tools:$PATH

                    gradle testDebugUnitTest assembleDebug --no-daemon

                    mkdir -p "$WORKSPACE/mobile-artifacts"
                    cp app/build/outputs/apk/debug/app-debug.apk \
                        "$WORKSPACE/mobile-artifacts/"
                '''
                archiveArtifacts artifacts: 'mobile-artifacts/*.apk', fingerprint: true
            }
        }

        stage('Smoke tests') {
            steps {
                sh '''
                    docker run --rm curlimages/curl:8.12.1 \
                        --fail --retry 5 --retry-delay 3 \
                        http://host.docker.internal/health

                    docker run --rm curlimages/curl:8.12.1 \
                        --fail --retry 5 --retry-delay 3 \
                        http://host.docker.internal/api/builds
                '''
            }
        }
    }

    post {
        success {
            echo 'MobCI CI/CD Pipeline completed successfully!'
        }
        failure {
            echo 'MobCI Pipeline failed!'
        }
        always {
            echo 'Pipeline execution finished.'
        }
    }
}
