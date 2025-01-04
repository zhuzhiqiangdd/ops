# Kubernetes Secret管理

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
- 安全工程师
- DevOps工程师
- 应用开发人员

### 前置知识
- Kubernetes基础概念
- 加密和安全基础
- Linux系统基础
- 容器技术基础

## Secret概述
### 基本概念
1. 定义
   - 用于存储敏感信息
   - Base64编码存储
   - 支持加密存储
   - 内存存储

2. 类型
   - Opaque：通用密钥
   - kubernetes.io/service-account-token：服务账号令牌
   - kubernetes.io/dockercfg：Docker配置
   - kubernetes.io/tls：TLS证书
   - bootstrap.kubernetes.io/token：启动引导令牌

3. 特性
   - 命名空间隔离
   - 加密存储
   - 内存挂载
   - 动态更新

## Secret创建
### 命令行创建
```bash
# 从文件创建
kubectl create secret generic db-user-pass \
    --from-file=username=./username.txt \
    --from-file=password=./password.txt

# 从字面值创建
kubectl create secret generic api-keys \
    --from-literal=api_key=1234567890 \
    --from-literal=api_secret=abcdefghijk

# 创建TLS密钥
kubectl create secret tls tls-secret \
    --cert=path/to/cert.pem \
    --key=path/to/key.pem

# 创建Docker仓库密钥
kubectl create secret docker-registry regcred \
    --docker-server=<your-registry-server> \
    --docker-username=<your-name> \
    --docker-password=<your-password> \
    --docker-email=<your-email>
```

### YAML文件创建
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  # Base64编码的数据
  username: YWRtaW4=
  password: MWYyZDFlMmU2N2Rm

---
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: base64_encoded_cert
  tls.key: base64_encoded_key
```

## Secret使用
### 环境变量方式
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-env-pod
spec:
  containers:
  - name: mycontainer
    image: myapp:1.0
    env:
    - name: SECRET_USERNAME
      valueFrom:
        secretKeyRef:
          name: mysecret
          key: username
    - name: SECRET_PASSWORD
      valueFrom:
        secretKeyRef:
          name: mysecret
          key: password
    envFrom:
    - secretRef:
        name: mysecret
```

### 卷挂载方式
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-vol-pod
spec:
  containers:
  - name: mycontainer
    image: myapp:1.0
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: mysecret
      items:
      - key: username
        path: app/username
      - key: password
        path: app/password
```

### 镜像拉取
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-reg-pod
spec:
  containers:
  - name: private-reg-container
    image: private-registry.io/myapp:1.0
  imagePullSecrets:
  - name: regcred
```

## 最佳实践
### 安全存储
1. 加密配置
```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
spec:
  resources:
  - resources:
    - secrets
    providers:
    - aescbc:
        keys:
        - name: key1
          secret: <base64-encoded-key>
    - identity: {}
```

2. 密钥轮换
```bash
# 生成新密钥
openssl rand -base64 32 > new_key.txt

# 更新Secret
kubectl create secret generic mysecret \
    --from-file=new_key.txt \
    -o yaml --dry-run=client | kubectl replace -f -
```

### 访问控制
1. RBAC配置
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
  resourceNames: ["mysecret"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-secrets
subjects:
- kind: ServiceAccount
  name: myapp
  namespace: default
roleRef:
  kind: Role
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

2. 网络策略
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: secret-network-policy
spec:
  podSelector:
    matchLabels:
      role: secret-consumer
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: authorized
```

### 监控审计
1. 审计策略
```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  resources:
  - group: ""
    resources: ["secrets"]
```

2. 告警规则
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: secret-alerts
spec:
  groups:
  - name: secrets
    rules:
    - alert: SecretAccessAnomaly
      expr: rate(secret_access_total[5m]) > 100
      for: 5m
      labels:
        severity: warning
```

## 故障排查
### 常见问题
1. 访问权限
   - RBAC配置错误
   - ServiceAccount权限不足
   - 密钥不在正确的命名空间
   - SELinux/AppArmor限制

2. 挂载问题
   - 路径权限不正确
   - 密钥不存在
   - 卷挂载配置错误
   - 容器重启问题

3. 加密问题
   - 加密配置错误
   - 密钥格式不正确
   - Base64编码错误
   - 证书链不完整

### 排查命令
```bash
# 检查Secret
kubectl get secret mysecret -o yaml
kubectl describe secret mysecret

# 检查Pod
kubectl describe pod secret-pod
kubectl logs secret-pod

# 验证挂载
kubectl exec -it secret-pod -- ls -la /etc/secrets
kubectl exec -it secret-pod -- cat /etc/secrets/username

# 检查权限
kubectl auth can-i get secrets --as system:serviceaccount:default:myapp
```

## 安全建议
1. 加密存储
   - 使用加密提供程序
   - 定期轮换密钥
   - 限制访问权限
   - 审计访问日志

2. 最小权限
   - 使用RBAC控制访问
   - 限制命名空间访问
   - 使用NetworkPolicy
   - 配置PodSecurityPolicy

3. 监控告警
   - 监控访问模式
   - 设置告警规则
   - 记录审计日志
   - 定期安全审查

## 参考资料
- [Kubernetes Secret文档](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Secret最佳实践](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)
- [加密数据存储](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)

## 相关文档
- [ConfigMap配置](./01_ConfigMap配置管理.md)
- [RBAC授权](../07_安全配置/02_RBAC授权.md)
- [安全加固](../07_安全配置/03_安全加固.md)
``` 