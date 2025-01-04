# Flux

## 1. 基本概念

### 1.1 Flux简介
1. 核心功能
   - GitOps工具
   - 配置管理
   - 自动部署
   - 多集群管理

2. 主要特点
   - 声明式API
   - 渐进式交付
   - 自动化运维
   - 安全可靠

### 1.2 架构设计
1. 核心组件
   - Source Controller
   - Kustomize Controller
   - Helm Controller
   - Notification Controller

2. 工作流程
   - 源码监控
   - 配置同步
   - 资源部署
   - 状态反馈

## 2. 部署配置

### 2.1 基础部署
1. 安装CLI
```bash
curl -s https://fluxcd.io/install.sh | sudo bash
```

2. 引导安装
```bash
flux bootstrap github \
  --owner=example \
  --repository=fleet-infra \
  --branch=main \
  --path=clusters/my-cluster \
  --personal
```

3. 组件配置
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: flux-system
  namespace: flux-system
spec:
  interval: 10m0s
  path: ./
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

### 2.2 源码配置
1. Git仓库
```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: GitRepository
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/stefanprodan/podinfo
  ref:
    branch: master
```

2. Helm仓库
```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 1m
  url: https://stefanprodan.github.io/podinfo
```

## 3. 应用管理

### 3.1 Kustomization
1. 基础配置
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 5m0s
  path: ./kustomize
  prune: true
  sourceRef:
    kind: GitRepository
    name: podinfo
  targetNamespace: default
```

2. 补丁配置
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: podinfo-patch
  namespace: flux-system
spec:
  dependsOn:
    - name: podinfo
  interval: 5m0s
  path: ./patches
  prune: true
  sourceRef:
    kind: GitRepository
    name: podinfo
  patches:
    - patch: |-
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: podinfo
        spec:
          replicas: 3
      target:
        kind: Deployment
        name: podinfo
```

### 3.2 Helm Release
1. 基础配置
```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 5m
  chart:
    spec:
      chart: podinfo
      version: '>=4.0.0 <5.0.0'
      sourceRef:
        kind: HelmRepository
        name: podinfo
        namespace: flux-system
      interval: 1m
  values:
    replicaCount: 2
    resources:
      limits:
        memory: 256Mi
      requests:
        cpu: 100m
        memory: 64Mi
```

2. 值覆盖
```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 5m
  chart:
    spec:
      chart: podinfo
      sourceRef:
        kind: HelmRepository
        name: podinfo
  valuesFrom:
  - kind: ConfigMap
    name: podinfo-values
    valuesKey: values.yaml
```

## 4. 自动化配置

### 4.1 镜像更新
1. 镜像策略
```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImagePolicy
metadata:
  name: podinfo
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: podinfo
  policy:
    semver:
      range: '>=4.0.0'
```

2. 自动更新
```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageUpdateAutomation
metadata:
  name: flux-system
  namespace: flux-system
spec:
  interval: 1m0s
  sourceRef:
    kind: GitRepository
    name: flux-system
  git:
    checkout:
      ref:
        branch: main
    commit:
      author:
        email: fluxcdbot@users.noreply.github.com
        name: fluxcdbot
      messageTemplate: '{{range .Updated.Images}}{{println .}}{{end}}'
    push:
      branch: main
```

### 4.2 通知配置
1. Provider配置
```yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta1
kind: Provider
metadata:
  name: slack
  namespace: flux-system
spec:
  type: slack
  channel: general
  secretRef:
    name: slack-url
```

2. Alert配置
```yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta1
kind: Alert
metadata:
  name: on-call-webapp
  namespace: flux-system
spec:
  providerRef:
    name: slack
  eventSeverity: info
  eventSources:
    - kind: GitRepository
      name: '*'
    - kind: Kustomization
      name: '*'
```

## 5. 最佳实践

### 5.1 配置管理
1. 多环境管理
   - 环境分离
   - 配置复用
   - 变量管理
   - 版本控制

2. 密钥管理
   - SOPS加密
   - 密钥轮换
   - 权限控制
   - 安全审计

### 5.2 运维建议
1. 日常维护
   - 状态监控
   - 日志分析
   - 备份恢复
   - 版本更新

2. 问题处理
   - 同步失败
   - 配置偏差
   - 资源冲突
   - 权限问题
