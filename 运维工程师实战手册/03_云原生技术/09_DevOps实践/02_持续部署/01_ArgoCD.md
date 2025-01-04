# ArgoCD

## 1. 基本概念

### 1.1 ArgoCD简介
1. 核心功能
   - GitOps工具
   - 应用部署
   - 配置管理
   - 状态同步

2. 主要特点
   - 声明式部署
   - 自动同步
   - 多集群管理
   - 状态可视化

### 1.2 架构设计
1. 核心组件
   - API Server
   - Repository Server
   - Application Controller
   - Dex Server

2. 工作流程
   - 配置拉取
   - 状态比对
   - 资源同步
   - 健康检查

## 2. 部署配置

### 2.1 基础部署
1. Namespace配置
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: argocd
```

2. 核心组件
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: argocd
resources:
- https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

3. Ingress配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server
  namespace: argocd
  annotations:
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
spec:
  rules:
  - host: argocd.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              name: https
```

### 2.2 高可用配置
1. Redis HA
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: argocd-redis-ha
  namespace: argocd
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis-ha
  template:
    metadata:
      labels:
        app: redis-ha
    spec:
      containers:
      - name: redis
        image: redis:6.2-alpine
        ports:
        - containerPort: 6379
```

2. 应用控制器
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-application-controller
  namespace: argocd
spec:
  replicas: 2
  selector:
    matchLabels:
      app: argocd-application-controller
  template:
    metadata:
      labels:
        app: argocd-application-controller
    spec:
      containers:
      - name: controller
        image: argoproj/argocd:latest
        command: [argocd-application-controller]
        env:
        - name: ARGOCD_CONTROLLER_REPLICAS
          value: "2"
```

## 3. 应用管理

### 3.1 应用配置
1. 基础应用
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

2. Helm应用
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nginx-ingress
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://kubernetes.github.io/ingress-nginx
    chart: ingress-nginx
    targetRevision: 4.0.1
    helm:
      values: |
        controller:
          replicaCount: 2
  destination:
    server: https://kubernetes.default.svc
    namespace: ingress-nginx
```

### 3.2 项目管理
1. 项目配置
```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
  namespace: argocd
spec:
  description: Production project
  sourceRepos:
  - '*'
  destinations:
  - namespace: prod-*
    server: https://kubernetes.default.svc
  clusterResourceWhitelist:
  - group: '*'
    kind: '*'
  namespaceResourceBlacklist:
  - group: ''
    kind: ResourceQuota
  - group: ''
    kind: LimitRange
```

2. RBAC配置
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: production-deployer
  namespace: argocd
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: production-deployer
  namespace: argocd
rules:
- apiGroups:
  - argoproj.io
  resources:
  - applications
  verbs:
  - get
  - list
  - watch
  - update
  - patch
```

## 4. 同步策略

### 4.1 自动同步
1. 基础配置
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auto-sync-app
spec:
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

2. 同步波次
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: wave-sync-app
spec:
  syncPolicy:
    automated: {}
  source:
    path: apps
    repoURL: https://github.com/example/repo.git
    targetRevision: HEAD
    directory:
      recurse: true
      jsonnet:
        tlas:
        - name: wave
          value: "1"
```

### 4.2 健康检查
1. 检查配置
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: health-check-app
spec:
  ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
    - /spec/replicas
  - group: ""
    kind: Service
    jsonPointers:
    - /spec/clusterIP
```

2. 资源钩子
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup-job
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: backup
        image: backup-tool
        command: ["backup"]
      restartPolicy: Never
```

## 5. 最佳实践

### 5.1 配置管理
1. 多环境管理
   - 环境分离
   - 配置复用
   - 变量管理
   - 版本控制

2. 密钥管理
   - 外部密钥
   - 加密存储
   - 权限控制
   - 自动更新

### 5.2 运维建议
1. 日常维护
   - 状态监控
   - 日志分析
   - 备份恢复
   - 版本更新

2. 问题处理
   - 同步失败
   - 健康检查
   - 配置偏差
   - 权限问题
