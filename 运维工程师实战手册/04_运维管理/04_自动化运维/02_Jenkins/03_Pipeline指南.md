# Jenkins Pipeline指南

## 版本信息
- 版本号: v1.0.0
- 更新日期: 2024-03-21
- 状态: [✅已完成]

## 1. Pipeline概述
### 1.1 什么是Pipeline
Pipeline是Jenkins的一个核心功能，它将持续交付流水线表达为代码。Pipeline提供了一组可扩展的工具，用于通过Pipeline DSL将简单到复杂的交付流水线建模为代码。

### 1.2 Pipeline特点
1. 代码化: 流水线以代码形式实现，通常保存在源代码控制中
2. 可持久化: Pipeline可以在Jenkins重启后继续执行
3. 可暂停: Pipeline可以选择性地停止并等待人工输入
4. 可扩展: Pipeline支持自定义扩展和集成
5. 并行执行: Pipeline支持复杂的并行执行

### 1.3 Pipeline类型
1. 声明式Pipeline
2. 脚本式Pipeline

## 2. 声明式Pipeline
### 2.1 基本结构
```groovy
pipeline {
    agent any
    
    environment {
        MAVEN_HOME = '/usr/local/maven'
    }
    
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
    }
    
    post {
        always {
            echo '构建完成'
        }
    }
}
```

### 2.2 核心概念
1. pipeline: 流水线的根元素
2. agent: 指定执行环境
3. stages: 定义一组stage
4. stage: 定义一个执行阶段
5. steps: 定义具体步骤
6. post: 定义完成后操作

### 2.3 环境变量
```groovy
pipeline {
    environment {
        // 全局环境变量
        GLOBAL_VAR = 'global value'
    }
    
    stages {
        stage('Example') {
            environment {
                // 阶段级环境变量
                STAGE_VAR = 'stage value'
            }
            steps {
                echo "GLOBAL_VAR = ${GLOBAL_VAR}"
                echo "STAGE_VAR = ${STAGE_VAR}"
            }
        }
    }
}
```

### 2.4 参数化构建
```groovy
pipeline {
    parameters {
        string(name: 'DEPLOY_ENV', defaultValue: 'staging', description: '部署环境')
        choice(name: 'VERSION', choices: ['1.0.0', '1.1.0', '1.2.0'], description: '版本选择')
        booleanParam(name: 'SKIP_TEST', defaultValue: false, description: '是否跳过测试')
    }
    
    stages {
        stage('Example') {
            steps {
                echo "Deploying to ${params.DEPLOY_ENV}"
                echo "Version: ${params.VERSION}"
                echo "Skip Test: ${params.SKIP_TEST}"
            }
        }
    }
}
```

## 3. 脚本式Pipeline
### 3.1 基本结构
```groovy
node {
    try {
        stage('Checkout') {
            checkout scm
        }
        
        stage('Build') {
            sh 'mvn clean package'
        }
        
        stage('Test') {
            sh 'mvn test'
        }
    } catch (e) {
        throw e
    } finally {
        echo '构建完成'
    }
}
```

### 3.2 流程控制
```groovy
node {
    stage('Example') {
        // 条件判断
        if (env.BRANCH_NAME == 'master') {
            echo '主分支构建'
        } else {
            echo '特性分支构建'
        }
        
        // 循环
        for (int i = 0; i < 3; i++) {
            echo "Count: ${i}"
        }
        
        // 异常处理
        try {
            sh 'some-command'
        } catch (Exception e) {
            echo "发生错误: ${e.message}"
        }
    }
}
```

## 4. Pipeline实践
### 4.1 Java应用构建
```groovy
pipeline {
    agent any
    
    tools {
        maven 'Maven 3.8.4'
        jdk 'JDK 11'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'mvn sonar:sonar'
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            emailext (
                subject: "构建成功: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                body: "查看详情: ${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
        failure {
            emailext (
                subject: "构建失败: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                body: "查看详情: ${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
    }
}
```

### 4.2 Docker镜像构建
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'registry.example.com'
        IMAGE_NAME = 'myapp'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Build Image') {
            steps {
                script {
                    docker.build("${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }
        
        stage('Push Image') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'registry-credentials') {
                        docker.image("${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }
    }
}
```

### 4.3 多分支Pipeline
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            when {
                anyOf {
                    branch 'master'
                    branch 'develop'
                    branch 'feature/*'
                }
            }
            steps {
                echo "Building branch ${env.BRANCH_NAME}"
                sh './build.sh'
            }
        }
        
        stage('Test') {
            when {
                anyOf {
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                sh './test.sh'
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh './deploy-staging.sh'
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                input message: '确认部署到生产环境?'
                sh './deploy-prod.sh'
            }
        }
    }
}
```

## 5. Pipeline共享库
### 5.1 创建共享库
```groovy
// vars/sayHello.groovy
def call(String name = 'human') {
    echo "Hello, ${name}!"
}

// vars/buildJava.groovy
def call(Map config) {
    pipeline {
        agent any
        stages {
            stage('Build') {
                steps {
                    sh "mvn -B -DskipTests clean package"
                }
            }
            stage('Test') {
                steps {
                    sh "mvn test"
                }
            }
        }
    }
}
```

### 5.2 使用共享库
```groovy
@Library('my-shared-library') _

pipeline {
    agent any
    stages {
        stage('Example') {
            steps {
                sayHello 'Jenkins'
            }
        }
    }
}
```

### 5.3 配置共享库
1. 系统管理 -> 系统配置 -> Global Pipeline Libraries
2. 配置库信息：
   - 名称
   - 默认版本
   - 源代码管理
   - 加载方式

## 6. Pipeline最佳实践
### 6.1 代码组织
1. 保持Pipeline代码简洁
2. 使用共享库封装通用逻辑
3. 合理使用环境变量
4. 遵循代码规范

### 6.2 性能优化
1. 并行执行阶段
```groovy
pipeline {
    agent any
    stages {
        stage('Parallel Stage') {
            parallel {
                stage('Branch A') {
                    steps {
                        echo "Branch A"
                    }
                }
                stage('Branch B') {
                    steps {
                        echo "Branch B"
                    }
                }
            }
        }
    }
}
```

2. 使用缓存
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                cache(maxCacheSize: 250, caches: [
                    [$class: 'ArbitraryFileCache', 
                     includes: '**/.m2/**', 
                     path: '${HOME}/.m2/repository']
                ]) {
                    sh 'mvn clean install'
                }
            }
        }
    }
}
```

### 6.3 错误处理
```groovy
pipeline {
    agent any
    stages {
        stage('Example') {
            steps {
                script {
                    try {
                        sh './risky-script.sh'
                    } catch (Exception e) {
                        echo "脚本执行失败: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        error("构建终止")
                    }
                }
            }
        }
    }
}
```

### 6.4 安全考虑
1. 使用凭据管理敏感信息
```groovy
pipeline {
    agent any
    environment {
        DATABASE_CREDS = credentials('database-credentials')
    }
    stages {
        stage('Example') {
            steps {
                sh '''
                    echo "用户名: $DATABASE_CREDS_USR"
                    echo "密码: $DATABASE_CREDS_PSW"
                '''
            }
        }
    }
}
```

2. 限制脚本权限
3. 定期审查Pipeline代码
4. 使用沙箱安全机制

## 7. 常见问题
1. Pipeline语法错误
2. 环境变量问题
3. 并发构建冲突
4. 资源限制问题
5. 权限配置问题

## 参考资料
1. Jenkins Pipeline官方文档
2. Jenkins共享库文档
3. Groovy语言文档
4. Jenkins Pipeline最佳实践指南 