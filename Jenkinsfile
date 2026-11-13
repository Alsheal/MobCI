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
                    set -e
                    test -f docker-compose.yml
                    test -f backend/package.json
                    test -f mobile/android-demo/app/build.gradle
                    docker version
                    echo "Workspace and Docker are available."
                '''
            }
        }

        stage('Backend tests') {
            steps {
                sh '''
                    set -e
                    docker build -f backend/Dockerfile.ci \
                        -t mobci-backend-test:latest backend
                    docker run --rm mobci-backend-test:latest
                '''
            }
        }

        stage('Build Docker images') {
            steps {
                sh '''
                    set -e
                    docker build -t mobci-adminer:latest adminer
                    docker build -t mobci-backend:latest backend
                    docker build -t mobci-db:latest db
                    docker build -t mobci-frontend:latest frontend
                    docker build -t mobci-proxy:latest proxy
                '''
            }
        }

        stage('Android tests and APK build') {
            steps {
                sh '''
                    set -e
                    cd mobile/android-demo
                    export ANDROID_HOME=/var/jenkins_home/android-sdk
                    export ANDROID_SDK_ROOT=/var/jenkins_home/android-sdk
                    export PATH=/var/jenkins_home/gradle/gradle-8.9/bin:$ANDROID_HOME/platform-tools:$PATH

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
                    set -e
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