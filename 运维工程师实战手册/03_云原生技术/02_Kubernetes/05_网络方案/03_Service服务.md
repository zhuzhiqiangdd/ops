# Kubernetes Service服务

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
- DNS基础知识
- 负载均衡基础

## Service概述
### 基本概念
1. 定义
   - 服务抽象层
   - 稳定访问端点
   - 负载均衡
   - 服务发现

2. 类型
   - ClusterIP
   - NodePort
   - LoadBalancer
   - ExternalName

3. 特性
   - 固定IP地址
   - 自动负载均衡
   - 服务发现
   - 会话保持

## Service类型
### ClusterIP
1. 特点
   - 集群内部访问
   - 虚拟IP地址
   - 自动负载均衡
   - DNS解析

2. 配置示例
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

### NodePort
1. 特点
   - 外部访问
   - 节点端口映射
   - 自动路由
   - 负载均衡

2. 配置示例
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nodeport-service
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

### LoadBalancer
1. 特点
   - 云平台集成
   - 外部负载均衡
   - 自动配置
   - 高可用性

2. 配置示例
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-lb-service
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

### ExternalName
1. 特点
   - 外部服务映射
   - DNS别名
   - 无代理
   - 跨命名空间

2. 配置示例
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-external-service
spec:
  type: ExternalName
  externalName: api.example.com
```

## 高级配置
### 会话保持
1. 基于客户端IP
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: myapp
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

2. 基于Cookie
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "route"
    nginx.ingress.kubernetes.io/session-cookie-expires: "172800"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "172800"
```

### 健康检查
1. 就绪探针
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    readinessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
```

2. 存活探针
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
```

### 流量策略
1. 外部流量策略
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: myapp
  externalTrafficPolicy: Local
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

2. 内部流量策略
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: myapp
  internalTrafficPolicy: Local
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

## 服务发现
### DNS服务
1. 服务DNS记录
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  namespace: my-ns
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

2. Pod DNS策略
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp
    image: myapp:1.0
  dnsPolicy: ClusterFirst
  dnsConfig:
    nameservers:
    - 1.2.3.4
    searches:
    - ns1.svc.cluster.local
    - my.dns.search.suffix
    options:
    - name: ndots
      value: "2"
```

### 服务发现
1. 环境变量
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    env:
    - name: MY_SERVICE_HOST
      value: $(MY_SERVICE_SERVICE_HOST)
    - name: MY_SERVICE_PORT
      value: $(MY_SERVICE_SERVICE_PORT)
```

2. DNS查询
```bash
# 服务DNS格式
<service-name>.<namespace>.svc.cluster.local

# 示例查询
nslookup my-service.default.svc.cluster.local
```

## 负载均衡
### 负载均衡算法
1. RoundRobin(默认)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

2. 会话保持
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: http
    service.beta.kubernetes.io/aws-load-balancer-sticky-sessions: "true"
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

### 高可用配置
1. 多可用区
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

2. 故障转移
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-connection-draining-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-connection-draining-timeout: "60"
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

## 监控和日志
### 监控指标
1. Prometheus监控
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: service-monitor
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
  - port: metrics
```

2. 指标收集
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9090"
    prometheus.io/path: "/metrics"
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

### 日志配置
1. 访问日志
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-access-log-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-access-log-emit-interval: "5"
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

2. 审计日志
```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  resources:
  - group: ""
    resources: ["services"]
```

## 故障排查
### 常见问题
1. 服务访问
   - DNS解析失败
   - 端口映射错误
   - 选择器配置错误
   - 网络策略限制

2. 负载均衡
   - 后端不可用
   - 会话保持失效
   - 证书配置错误
   - 超时设置不当

3. 性能问题
   - 连接数过高
   - 响应时间过长
   - 资源不足
   - 配置不优

### 排查命令
```bash
# 检查Service
kubectl get svc
kubectl describe svc <service-name>

# 检查Endpoints
kubectl get endpoints
kubectl describe endpoints <service-name>

# 检查DNS
kubectl exec -it <pod-name> -- nslookup <service-name>
kubectl exec -it <pod-name> -- cat /etc/resolv.conf

# 检查连接
kubectl exec -it <pod-name> -- curl <service-name>
kubectl exec -it <pod-name> -- netstat -an
```

## 最佳实践
1. 服务命名
   - 使用有意义的名称
   - 遵循命名规范
   - 添加适当标签
   - 注意命名空间

2. 高可用性
   - 多副本部署
   - 反亲和性调度
   - 资源限制
   - 自动扩缩容

3. 安全性
   - 网络策略
   - 访问控制
   - 证书管理
   - 加密传输

4. 性能优化
   - 合理的超时设置
   - 适当的缓存策略
   - 资源预留
   - 监控告警

## 参考资料
- [Kubernetes Service文档](https://kubernetes.io/docs/concepts/services-networking/service/)
- [DNS配置](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [负载均衡](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer)

## 相关文档
- [网络基础概念](./01_网络基础概念.md)
- [Ingress配置](./04_Ingress配置.md)
- [网络策略](./05_网络策略.md)
``` 