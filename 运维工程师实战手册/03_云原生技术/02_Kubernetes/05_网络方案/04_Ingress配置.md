# Kubernetes Ingress配置

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
- 网络基础知识
- HTTP/HTTPS协议
- 负载均衡基础

## Ingress概述
### 基本概念
1. 定义
   - 七层负载均衡
   - 路由规则管理
   - SSL/TLS终止
   - 虚拟主机配置

2. 功能
   - URL路由
   - 负载均衡
   - SSL终止
   - 名称虚拟主机

3. 组件
   - Ingress资源
   - Ingress控制器
   - 后端服务
   - 证书管理

## Ingress控制器
### Nginx Ingress
1. 安装配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: ingress-nginx
spec:
  selector:
    matchLabels:
      app: nginx-ingress
  template:
    metadata:
      labels:
        app: nginx-ingress
    spec:
      containers:
      - name: nginx-ingress-controller
        image: k8s.gcr.io/ingress-nginx/controller:v1.1.0
        args:
        - /nginx-ingress-controller
        - --publish-service=$(POD_NAMESPACE)/ingress-nginx
        - --election-id=ingress-controller-leader
        - --controller-class=k8s.io/ingress-nginx
        - --configmap=$(POD_NAMESPACE)/ingress-nginx-controller
```

2. 基本配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: minimal-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /testpath
        pathType: Prefix
        backend:
          service:
            name: test
            port:
              number: 80
```

### Traefik Ingress
1. 安装配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
spec:
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      containers:
      - name: traefik
        image: traefik:v2.6
        args:
        - --api.insecure
        - --providers.kubernetesingress
```

2. 基本配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: traefik-ingress
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: example-service
            port:
              number: 80
```

## 路由配置
### 基本路由
1. 路径路由
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-ingress
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /app1
        pathType: Prefix
        backend:
          service:
            name: app1-service
            port:
              number: 80
      - path: /app2
        pathType: Prefix
        backend:
          service:
            name: app2-service
            port:
              number: 80
```

2. 主机路由
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: host-ingress
spec:
  rules:
  - host: app1.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app1-service
            port:
              number: 80
  - host: app2.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app2-service
            port:
              number: 80
```

### 高级路由
1. 正则表达式
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: regex-ingress
  annotations:
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /app[1-9]
        pathType: ImplementationSpecific
        backend:
          service:
            name: app-service
            port:
              number: 80
```

2. 重写规则
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rewrite-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: api-service
            port:
              number: 80
```

## SSL/TLS配置
### 证书配置
1. TLS证书
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: base64_encoded_cert
  tls.key: base64_encoded_key

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - example.com
    secretName: tls-secret
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

2. 自动证书
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: example-cert
spec:
  secretName: tls-secret
  duration: 2160h # 90d
  renewBefore: 360h # 15d
  subject:
    organizations:
    - Example Inc.
  commonName: example.com
  dnsNames:
  - example.com
  - www.example.com
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
```

### 安全配置
1. HSTS配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
  annotations:
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/hsts: "max-age=31536000; includeSubDomains"
spec:
  tls:
  - hosts:
    - secure.example.com
    secretName: tls-secret
```

2. 客户端认证
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mutual-tls-ingress
  annotations:
    nginx.ingress.kubernetes.io/auth-tls-verify-client: "on"
    nginx.ingress.kubernetes.io/auth-tls-secret: "default/ca-secret"
spec:
  tls:
  - hosts:
    - mtls.example.com
    secretName: tls-secret
```

## 负载均衡
### 负载均衡配置
1. 会话保持
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sticky-ingress
  annotations:
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "route"
    nginx.ingress.kubernetes.io/session-cookie-expires: "172800"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "172800"
spec:
  rules:
  - host: example.com
```

2. 负载均衡算法
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lb-ingress
  annotations:
    nginx.ingress.kubernetes.io/load-balance: "round_robin"
spec:
  rules:
  - host: example.com
```

### 流量控制
1. 限速配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rate-limit-ingress
  annotations:
    nginx.ingress.kubernetes.io/limit-rps: "10"
    nginx.ingress.kubernetes.io/limit-connections: "5"
spec:
  rules:
  - host: example.com
```

2. 超时配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: timeout-ingress
  annotations:
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
spec:
  rules:
  - host: example.com
```

## 监控和日志
### 监控配置
1. Prometheus监控
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ingress-monitor
spec:
  selector:
    matchLabels:
      app: nginx-ingress
  endpoints:
  - port: metrics
```

2. 指标收集
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: metrics-ingress
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "10254"
spec:
  rules:
  - host: example.com
```

### 日志配置
1. 访问日志
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: logging-ingress
  annotations:
    nginx.ingress.kubernetes.io/enable-access-log: "true"
    nginx.ingress.kubernetes.io/access-log-path: "/var/log/nginx/access.log"
spec:
  rules:
  - host: example.com
```

2. 错误日志
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: error-logging-ingress
  annotations:
    nginx.ingress.kubernetes.io/error-log-level: "notice"
spec:
  rules:
  - host: example.com
```

## 故障排查
### 常见问题
1. 路由问题
   - 路径匹配失败
   - 主机名解析错误
   - 后端服务不可用
   - 证书配置错误

2. 性能问题
   - 连接数过高
   - 响应时间过长
   - 资源不足
   - 配置不优

3. 证书问题
   - 证书过期
   - 证书链不完整
   - 私钥不匹配
   - SNI配置错误

### 排查命令
```bash
# 检查Ingress状态
kubectl get ingress
kubectl describe ingress <ingress-name>

# 检查Ingress控制器
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx <ingress-pod>

# 检查证书
kubectl get secrets
kubectl describe secret <tls-secret>

# 检查配置
kubectl get configmap -n ingress-nginx
kubectl describe configmap -n ingress-nginx nginx-configuration
```

## 最佳实践
1. 路由设计
   - 合理的路径规划
   - 清晰的主机名规范
   - 适当的重写规则
   - 有效的后端服务

2. 安全加固
   - HTTPS强制
   - 证书自动续期
   - 访问控制
   - 安全头部

3. 性能优化
   - 合理的超时设置
   - 适当的缓存策略
   - 会话保持配置
   - 限速保护

4. 运维管理
   - 监控告警
   - 日志收集
   - 定期备份
   - 版本管理

## 参考资料
- [Kubernetes Ingress文档](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Nginx Ingress控制器](https://kubernetes.github.io/ingress-nginx/)
- [Traefik Ingress控制器](https://doc.traefik.io/traefik/providers/kubernetes-ingress/)

## 相关文档
- [网络基础概念](./01_网络基础概念.md)
- [Service服务](./03_Service服务.md)
- [网络策略](./05_网络策略.md)
``` 