# GitLab CI

## 1. 基本概念

### 1.1 GitLab CI简介
1. 核心功能
   - 代码集成
   - 自动构建
   - 自动测试
   - 自动部署

2. 主要特点
   - 与GitLab深度集成
   - 配置简单
   - 支持Docker
   - 可扩展性强

### 1.2 架构设计
1. 核心组件
   - GitLab Server
   - GitLab Runner
   - Pipeline
   - Cache/Artifacts

2. 工作流程
   - 代码提交
   - 触发Pipeline
   - 执行Job
   - 反馈结果

## 2. Runner配置

### 2.1 Kubernetes Runner
1. Runner配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gitlab-runner
  namespace: gitlab
data:
  config.toml: |
    concurrent = 4
    check_interval = 30
    [[runners]]
      name = "kubernetes-runner"
      url = "https://gitlab.example.com/"
      token = "PROJECT_TOKEN"
      executor = "kubernetes"
      [runners.kubernetes]
        namespace = "gitlab"
        image = "ubuntu:20.04"
```

2. Deployment配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gitlab-runner
  namespace: gitlab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: gitlab-runner
  template:
    metadata:
      labels:
        app: gitlab-runner
    spec:
      serviceAccountName: gitlab-runner
      containers:
      - name: gitlab-runner
        image: gitlab/gitlab-runner:latest
        volumeMounts:
        - name: config
          mountPath: /etc/gitlab-runner
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: gitlab-runner
```

### 2.2 Docker Runner
1. Runner注册
```bash
docker run --rm -v /srv/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.example.com/" \
  --registration-token "PROJECT_TOKEN" \
  --executor "docker" \
  --docker-image alpine:latest \
  --description "docker-runner" \
  --tag-list "docker,aws" \
  --run-untagged="true" \
  --locked="false"
```

2. Runner配置
```toml
concurrent = 4
check_interval = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "docker-runner"
  url = "https://gitlab.example.com"
  token = "PROJECT_TOKEN"
  executor = "docker"
  [runners.custom_build_dir]
  [runners.cache]
    [runners.cache.s3]
    [runners.cache.gcs]
  [runners.docker]
    tls_verify = false
    image = "alpine:latest"
    privileged = false
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
```

## 3. 流水线配置

### 3.1 基础流水线
1. .gitlab-ci.yml配置
```yaml
image: maven:3.8.1-jdk-8

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"

cache:
  paths:
    - .m2/repository

stages:
  - build
  - test
  - package
  - deploy

build:
  stage: build
  script:
    - mvn compile

test:
  stage: test
  script:
    - mvn test

package:
  stage: package
  script:
    - mvn package
  artifacts:
    paths:
      - target/*.jar

deploy:
  stage: deploy
  script:
    - echo "部署应用"
  environment:
    name: production
  only:
    - main
```

2. Docker构建配置
```yaml
image: docker:latest

services:
  - docker:dind

variables:
  DOCKER_HOST: tcp://docker:2375
  DOCKER_TLS_CERTDIR: ""

stages:
  - build
  - push

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

push:
  stage: push
  script:
    - docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
```

### 3.2 高级配置
1. 多环境部署
```yaml
stages:
  - build
  - test
  - deploy

.deploy_template: &deploy_definition
  script:
    - echo "部署到 $CI_ENVIRONMENT_NAME"
    - kubectl apply -f k8s/$CI_ENVIRONMENT_NAME/

deploy_dev:
  <<: *deploy_definition
  environment:
    name: dev
  only:
    - develop

deploy_staging:
  <<: *deploy_definition
  environment:
    name: staging
  only:
    - release/*

deploy_prod:
  <<: *deploy_definition
  environment:
    name: prod
  when: manual
  only:
    - main
```

2. 并行任务
```yaml
stages:
  - test

.test_template: &test_definition
  image: python:3.9
  before_script:
    - pip install -r requirements.txt

unit_test:
  <<: *test_definition
  script:
    - pytest tests/unit

integration_test:
  <<: *test_definition
  script:
    - pytest tests/integration

performance_test:
  <<: *test_definition
  script:
    - locust -f tests/performance/locustfile.py
  allow_failure: true
```

## 4. 最佳实践

### 4.1 优化配置
1. 缓存优化
   - 依赖缓存
   - 构建缓存
   - 测试缓存
   - Docker缓存

2. 性能优化
   - 并行执行
   - 资源限制
   - 超时控制
   - 失败重试

### 4.2 运维建议
1. 日常维护
   - Runner管理
   - 缓存清理
   - 日志分析
   - 监控告警

2. 问题处理
   - 构建失败
   - Runner异常
   - 网络问题
   - 权限问题
