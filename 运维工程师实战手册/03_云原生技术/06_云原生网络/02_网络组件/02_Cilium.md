# Cilium网络组件

## 1. 基本概念

### 1.1 什么是Cilium
Cilium是一个开源软件，用于提供、保护和观察容器工作负载之间的网络连接。它基于eBPF技术，主要特点：
- 基于eBPF技术
- L3/L4/L7层网络策略
- 透明加密
- 负载均衡
- 可观测性

### 1.2 核心功能
1. 网络功能
   - CNI实现
   - Service负载均衡
   - 透明加密
   - 多集群连接

2. 安全功能
   - 网络策略
   - 身份认证
   - 流量可视化
   - API感知安全

## 2. 架构设计

### 2.1 核心组件
1. Agent
   - eBPF程序管理
   - 网络策略执行
   - 监控数据收集
   - 身份管理

2. Operator
   - 集群管理
   - CRD处理
   - 节点生命周期
   - 服务同步

3. CNI插件
   - 网络配置
   - 接口管理
   - IP分配
   - 路由设置

### 2.2 数据流向
1. Pod网络
```
Pod -> veth -> eBPF TC -> Host Network -> eBPF TC -> veth -> Pod
```

2. Service网络
```
Client -> eBPF LB -> Backend Selection -> Service Backend
```

## 3. 部署配置

### 3.1 安装部署
1. Helm安装
```bash
# 添加Helm仓库
helm repo add cilium https://helm.cilium.io/

# 安装Cilium
helm install cilium cilium/cilium \
  --namespace kube-system \
  --set kubeProxyReplacement=strict \
  --set tunnel=disabled \
  --set autoDirectNodeRoutes=true
```

2. 配置参数
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cilium-config
  namespace: kube-system
data:
  tunnel: "disabled"
  enable-ipv4: "true"
  enable-ipv6: "false"
  identity-allocation-mode: "crd"
  debug: "false"
```

### 3.2 网络配置
1. 基础网络
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "basic-network"
spec:
  endpointSelector:
    matchLabels:
      app: myapp
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
```

2. 加密配置
```yaml
apiVersion: cilium.io/v2
kind: CiliumClusterwideNetworkPolicy
metadata:
  name: "encrypt-traffic"
spec:
  endpointSelector:
    matchLabels: {}
  ingressRule:
    - fromEndpoints:
      - matchLabels: {}
    toPorts:
    - ports:
      - port: "443"
        protocol: TCP
  encrypt: true
```

## 4. 网络策略

### 4.1 L3/L4策略
1. 基本策略
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "l3-l4-policy"
spec:
  endpointSelector:
    matchLabels:
      app: api
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend
    toPorts:
    - ports:
      - port: "8080"
        protocol: TCP
```

2. 集群策略
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumClusterwideNetworkPolicy
metadata:
  name: "cluster-policy"
spec:
  nodeSelector:
    matchLabels:
      kubernetes.io/hostname: worker-1
  ingress:
  - fromEndpoints:
    - matchLabels:
        io.kubernetes.pod.namespace: monitoring
```

### 4.2 L7策略
1. HTTP策略
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "l7-policy"
spec:
  endpointSelector:
    matchLabels:
      app: api
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
      rules:
        http:
        - method: "GET"
          path: "/api/v1/.*"
```

2. Kafka策略
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "kafka-policy"
spec:
  endpointSelector:
    matchLabels:
      app: kafka
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: producer
    toPorts:
    - ports:
      - port: "9092"
        protocol: TCP
      rules:
        kafka:
        - topic: "topic1"
          apiKey: "produce"
```

## 5. 监控管理

### 5.1 监控配置
1. Prometheus集成
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cilium-metrics
  namespace: kube-system
data:
  metrics: |
    metrics:
      enabled: true
      port: 9090
```

2. Hubble配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cilium-config
  namespace: kube-system
data:
  hubble-enabled: "true"
  hubble-metrics: "dns,drop,tcp,flow,port-distribution,icmp,http"
```

### 5.2 日志管理
1. 调试日志
```bash
# 开启调试模式
cilium config Debug=true

# 查看组件日志
kubectl logs -n kube-system cilium-xxxxx
```

2. 流量分析
```bash
# 使用Hubble观察流量
hubble observe --follow

# 查看特定Pod流量
hubble observe --pod web-app --follow
```

## 6. 故障排查

### 6.1 常见问题
1. 连通性问题
```bash
# 检查Cilium状态
cilium status

# 检查节点健康
cilium node list

# 检查端点状态
cilium endpoint list
```

2. 策略问题
```bash
# 查看策略状态
cilium policy get

# 导入策略
cilium policy import policy.json

# 删除策略
cilium policy delete --all
```

### 6.2 性能优化
1. eBPF优化
```bash
# 检查eBPF映射状态
cilium bpf maps list

# 清理eBPF映射
cilium cleanup
```

2. 资源配置
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: cilium
spec:
  template:
    spec:
      containers:
      - name: cilium-agent
        resources:
          requests:
            cpu: 100m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
``` 