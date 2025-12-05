pipeline {
    agent any

    environment {
        // ACR
        REGISTRY = "xuetangx-registry.cn-beijing.cr.aliyuncs.com"
        NAMESPACE = "xtng"
        APP_NAME = "xc/xc-server"

        // GitHub Token
        GITHUB_TOKEN = credentials('github_token')
    }

    tools {
        nodejs "nodejs25"
    }

    stages {

        stage('Checkout GitHub') {
            steps {
                git(
                    url: 'https://github.com/42-first/remote-teacher.git',
                    credentialsId: '203d6a3f-a952-49bf-a80b-bcf1a7bdbac4',
                    branch: 'master'
                )
            }
        }

        stage('Install NPM Dependencies') {
            steps {
                sh 'npm install --registry https://registry.npmmirror.com'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    IMAGE = "${REGISTRY}/${NAMESPACE}/${APP_NAME}:${BUILD_NUMBER}"
                    sh "docker build -t ${IMAGE} ."
                }
            }
        }

        stage('Login ACR') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aliyun_acr', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh """
                    docker login --username=${USER} --password=${PASS} ${REGISTRY}
                    """
                }
            }
        }

        stage('Push Image') {
            steps {
                script {
                    sh "docker push ${IMAGE}"
                }
            }
        }

        stage('Tag Latest') {
            steps {
                script {
                    sh """
                    docker tag ${IMAGE} ${REGISTRY}/${NAMESPACE}/${APP_NAME}:latest
                    docker push ${REGISTRY}/${NAMESPACE}/${APP_NAME}:latest
                    """
                }
            }
        }
    }
}
