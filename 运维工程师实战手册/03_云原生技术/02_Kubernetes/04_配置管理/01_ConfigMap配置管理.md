# Kubernetes ConfigMap配置管理

## 文档信息
- 版本: v1.0.0
- 更新时间: 2024-03-21
- 状态: [🏗️进行中]
- 作者: System Admin

## 修订历史
| 版本 | 日期 | 描述 | 作者 |
|-----|------|-----|-----|
| v1.0.0 | 2024-03-21 | 初始版本 | System Admin |

## 文档说明
### 目标读者
- Kubernetes管理员
- 应用开发人员
- DevOps工程师
- 平台运维人员

### 前置知识
- Kubernetes基础概念
- YAML配置语法
- Linux系统基础
- 容器技术基础

## ConfigMap概述
### 基本概念
1. 定义
   - 用于存储非敏感的配置数据
   - 键值对形式
   - 可以被Pod引用
   - 支持动态更新

2. 使用场景
   - 应用配置文件
   - 环境变量
   - 命令行参数
   - 容器启动配置

3. 特性
   - 与Pod解耦
   - 可以跨命名空间
   - 支持二进制数据
   - 支持热更新

## ConfigMap创建
### 命令行创建
```bash
# 从文件创建
kubectl create configmap app-config --from-file=app.properties

# 从目录创建
kubectl create configmap app-config --from-file=config/

# 从字面值创建
kubectl create configmap app-config \
    --from-literal=api.url=http://api.example.com \
    --from-literal=api.port=8443

# 从环境文件创建
kubectl create configmap app-config --from-env-file=app.env
```

### YAML文件创建
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  # 简单键值对
  api.url: "http://api.example.com"
  api.port: "8443"
  
  # 配置文件
  app.properties: |
    app.name=MyApp
    app.version=1.0.0
    app.environment=production
    
  # JSON配置
  config.json: |
    {
      "database": {
        "host": "db.example.com",
        "port": 5432,
        "name": "myapp"
      },
      "cache": {
        "enabled": true,
        "ttl": 3600
      }
    }
```

## ConfigMap使用
### 环境变量方式
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app-container
    image: myapp:1.0
    env:
    # 单个键值对
    - name: API_URL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: api.url
    
    # 导入所有键值对
    envFrom:
    - configMapRef:
        name: app-config
```

### 卷挂载方式
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app-container
    image: myapp:1.0
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
      # 选择性挂载
      items:
      - key: app.properties
        path: application.properties
      - key: config.json
        path: config.json
```

### 命令行参数
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app-container
    image: myapp:1.0
    command: ["/bin/sh", "-c"]
    args:
    - java -jar app.jar
      --spring.config.location=/etc/config/application.properties
      --server.port=$(API_PORT)
    env:
    - name: API_PORT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: api.port
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

## 最佳实践
### 配置分层
1. 基础配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-base-config
data:
  app.properties: |
    app.name=MyApp
    app.version=1.0.0
```

2. 环境特定配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-env-config-prod
data:
  env.properties: |
    environment=production
    log.level=INFO
    metrics.enabled=true
```

3. 应用组合配置
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app-container
    image: myapp:1.0
    volumeMounts:
    - name: base-config
      mountPath: /etc/config/base
    - name: env-config
      mountPath: /etc/config/env
  volumes:
  - name: base-config
    configMap:
      name: app-base-config
  - name: env-config
    configMap:
      name: app-env-config-prod
```

### 版本管理
1. 使用标签
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-v1
  labels:
    app: myapp
    version: v1
data:
  app.properties: |
    version=1.0.0
```

2. 使用注解
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  annotations:
    config.version: "1.0.0"
    last.updated: "2024-03-21"
    update.by: "admin"
data:
  app.properties: |
    version=1.0.0
```

### 动态更新
1. 自动重载配置
```yaml
apiVersion: v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  template:
    metadata:
      annotations:
        # 添加配置版本注解
        configmap.version: "v1"
    spec:
      containers:
      - name: app-container
        image: myapp:1.0
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
      volumes:
      - name: config-volume
        configMap:
          name: app-config
```

2. 配置热更新
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app-container
    image: myapp:1.0
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "config-reload.sh"]
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

## 故障排查
### 常见问题
1. 配置未更新
   - 检查ConfigMap是否正确创建
   - 验证Pod是否正确引用
   - 确认卷挂载路径
   - 检查应用程序重载机制

2. 权限问题
   - 检查命名空间访问权限
   - 验证ServiceAccount权限
   - 确认文件系统权限
   - 检查SELinux上下文

3. 格式错误
   - 验证YAML语法
   - 检查配置文件格式
   - 确认字符编码
   - 检查特殊字符转义

### 排查命令
```bash
# 查看ConfigMap详情
kubectl describe configmap app-config

# 检查Pod配置
kubectl describe pod app-pod

# 查看Pod日志
kubectl logs app-pod

# 进入容器验证
kubectl exec -it app-pod -- ls /etc/config
kubectl exec -it app-pod -- cat /etc/config/app.properties

# 查看事件
kubectl get events --field-selector involvedObject.name=app-pod
```

## 安全建议
1. 访问控制
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: configmap-reader
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "watch"]
```

2. 命名空间隔离
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app-prod
  labels:
    environment: production
```

3. 加密配置
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  api.key: BASE64_ENCODED_API_KEY
```

## 监控和审计
1. 资源监控
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: configmap-monitor
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
  - port: metrics
```

2. 审计日志
```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  resources:
  - group: ""
    resources: ["configmaps"]
```

## 参考资料
- [Kubernetes ConfigMap文档](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [配置最佳实践](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Pod配置指南](https://kubernetes.io/docs/tasks/configure-pod-container/)

## 相关文档
- [Secret管理](./02_Secret管理.md)
- [Pod配置](../03_工作负载管理/01_Pod管理.md)
- [安全配置](../07_安全配置/01_认证授权.md)
``` 