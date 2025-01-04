# Jenkins持续集成

## 1. 基本概念

### 1.1 Jenkins简介
1. 核心功能
   - 自动化构建
   - 持续集成
   - 持续部署
   - 流水线管理

2. 主要特点
   - 插件丰富
   - 分布式构建
   - 易于扩展
   - 社区活跃

### 1.2 架构设计
1. 核心组件
   - Master节点
   - Agent节点
   - 插件系统
   - 任务调度

2. 工作流程
   - 代码提交
   - 触发构建
   - 执行任务
   - 反馈结果

## 2. 部署配置

### 2.1 Kubernetes部署
1. Namespace配置
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: jenkins
```

2. ServiceAccount配置
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: jenkins
  namespace: jenkins
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: jenkins
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: jenkins
  namespace: jenkins
```

3. 持久化存储
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-pvc
  namespace: jenkins
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

4. Deployment配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jenkins
  namespace: jenkins
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jenkins
  template:
    metadata:
      labels:
        app: jenkins
    spec:
      serviceAccountName: jenkins
      containers:
      - name: jenkins
        image: jenkins/jenkins:lts
        ports:
        - containerPort: 8080
        - containerPort: 50000
        volumeMounts:
        - name: jenkins-home
          mountPath: /var/jenkins_home
      volumes:
      - name: jenkins-home
        persistentVolumeClaim:
          claimName: jenkins-pvc
```

5. Service配置
```yaml
apiVersion: v1
kind: Service
metadata:
  name: jenkins
  namespace: jenkins
spec:
  type: NodePort
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 30080
  selector:
    app: jenkins
```

### 2.2 插件配置
1. 必要插件
   - Kubernetes插件
   - Pipeline插件
   - Git插件
   - Credentials插件

2. 系统配置
   - 全局工具配置
   - 凭据管理
   - 安全设置
   - 邮件通知

## 3. 流水线配置

### 3.1 基础流水线
1. Jenkinsfile配置
```groovy
pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: maven
                    image: maven:3.8.1-jdk-8
                    command:
                    - cat
                    tty: true
                  - name: docker
                    image: docker:latest
                    command:
                    - cat
                    tty: true
                    volumeMounts:
                    - name: docker-sock
                      mountPath: /var/run/docker.sock
                  volumes:
                  - name: docker-sock
                    hostPath:
                      path: /var/run/docker.sock
            '''
        }
    }
    stages {
        stage('拉取代码') {
            steps {
                git 'https://github.com/example/app.git'
            }
        }
        stage('编译构建') {
            steps {
                container('maven') {
                    sh 'mvn clean package'
                }
            }
        }
        stage('构建镜像') {
            steps {
                container('docker') {
                    sh '''
                        docker build -t app:${BUILD_NUMBER} .
                        docker push app:${BUILD_NUMBER}
                    '''
                }
            }
        }
    }
    post {
        success {
            echo '构建成功'
        }
        failure {
            echo '构建失败'
        }
    }
}
```

2. 多分支流水线
```groovy
pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: maven
                    image: maven:3.8.1-jdk-8
                    command:
                    - cat
                    tty: true
            '''
        }
    }
    stages {
        stage('分支构建') {
            when {
                branch 'feature/*'
            }
            steps {
                container('maven') {
                    sh 'mvn clean package'
                }
            }
        }
        stage('主干构建') {
            when {
                branch 'main'
            }
            steps {
                container('maven') {
                    sh '''
                        mvn clean package
                        mvn sonar:sonar
                    '''
                }
            }
        }
    }
}
```

### 3.2 高级配置
1. 参数化构建
```groovy
pipeline {
    agent any
    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: '构建分支')
        choice(name: 'ENV', choices: ['dev', 'test', 'prod'], description: '部署环境')
        booleanParam(name: 'SKIP_TEST', defaultValue: false, description: '是否跳过测试')
    }
    stages {
        stage('准备') {
            steps {
                echo "构建分支: ${params.BRANCH}"
                echo "部署环境: ${params.ENV}"
            }
        }
        stage('测试') {
            when {
                expression { return !params.SKIP_TEST }
            }
            steps {
                sh 'mvn test'
            }
        }
    }
}
```

2. 并行构建
```groovy
pipeline {
    agent any
    stages {
        stage('并行测试') {
            parallel {
                stage('单元测试') {
                    steps {
                        sh 'mvn test'
                    }
                }
                stage('集成测试') {
                    steps {
                        sh 'mvn verify'
                    }
                }
            }
        }
    }
}
```

## 4. 最佳实践

### 4.1 安全配置
1. 权限管理
   - 角色划分
   - 权限分配
   - 审计日志
   - 凭据管理

2. 环境隔离
   - 开发环境
   - 测试环境
   - 生产环境
   - 权限隔离

### 4.2 运维建议
1. 日常维护
   - 定期备份
   - 插件更新
   - 性能优化
   - 日志清理

2. 问题处理
   - 构建失败
   - 节点离线
   - 资源不足
   - 权限问题
