# Calico网络组件

## 1. 基本概念

### 1.1 什么是Calico
Calico是一个开源的网络和网络安全解决方案，为容器、虚拟机和裸机工作负载提供网络连接和网络安全。主要特点：
- 高性能数据平面
- 灵活的网络策略
- 可扩展的网络方案
- 跨平台支持

### 1.2 核心功能
1. 网络功能
   - 容器网络接口(CNI)
   - BGP路由
   - IPAM管理
   - 跨子网通信

2. 安全功能
   - 网络策略
   - 微分段
   - 加密通信
   - 访问控制

## 2. 架构设计

### 2.1 核心组件
1. Felix
   - 路由编程
   - ACL管理
   - 接口管理
   - 状态报告

2. BIRD
   - BGP客户端
   - 路由分发
   - 路由反射
   - 路由过滤

3. Confd
   - 配置管理
   - 模板渲染
   - 动态更新
   - 服务发现

4. CNI插件
   - 网络配置
   - IP分配
   - 路由设置
   - 策略应用

### 2.2 数据流向
1. 同节点通信
```
Pod1 -> veth -> Host Route -> veth -> Pod2
```

2. 跨节点通信
```
Pod1 -> veth -> Host Route -> BGP -> Physical Network -> Host Route -> veth -> Pod2
```

## 3. 部署配置

### 3.1 安装部署
1. 使用Operator安装
```bash
# 安装Operator
kubectl create -f https://docs.projectcalico.org/manifests/tigera-operator.yaml

# 安装Calico
kubectl create -f https://docs.projectcalico.org/manifests/custom-resources.yaml
```

2. 配置自定义资源
```yaml
apiVersion: operator.tigera.io/v1
kind: Installation
metadata:
  name: default
spec:
  calicoNetwork:
    ipPools:
    - blockSize: 26
      cidr: 192.168.0.0/16
      encapsulation: VXLANCrossSubnet
      natOutgoing: true
      nodeSelector: all()
```

### 3.2 网络配置
1. IP池配置
```yaml
apiVersion: projectcalico.org/v3
kind: IPPool
metadata:
  name: default-ipv4-ippool
spec:
  cidr: 192.168.0.0/16
  ipipMode: Always
  natOutgoing: true
  nodeSelector: all()
```

2. BGP配置
```yaml
apiVersion: projectcalico.org/v3
kind: BGPConfiguration
metadata:
  name: default
spec:
  logSeverityScreen: Info
  nodeToNodeMeshEnabled: true
  asNumber: 63400
```

## 4. 网络策略

### 4.1 基本策略
1. 默认拒绝策略
```yaml
apiVersion: projectcalico.org/v3
kind: GlobalNetworkPolicy
metadata:
  name: default-deny
spec:
  selector: all()
  types:
  - Ingress
  - Egress
```

2. 允许特定流量
```yaml
apiVersion: projectcalico.org/v3
kind: NetworkPolicy
metadata:
  name: allow-app-traffic
  namespace: default
spec:
  selector: app == 'frontend'
  types:
  - Ingress
  - Egress
  ingress:
  - action: Allow
    protocol: TCP
    destination:
      ports:
      - 80
```

### 4.2 高级策略
1. 规则优先级
```yaml
apiVersion: projectcalico.org/v3
kind: GlobalNetworkPolicy
metadata:
  name: security-policy
spec:
  order: 100
  selector: all()
  types:
  - Ingress
  ingress:
  - action: Allow
    source:
      selector: role == 'frontend'
```

2. 流量控制
```yaml
apiVersion: projectcalico.org/v3
kind: NetworkPolicy
metadata:
  name: traffic-control
spec:
  selector: app == 'database'
  types:
  - Ingress
  ingress:
  - action: Allow
    source:
      selector: app == 'backend'
    destination:
      ports:
      - 5432
```

## 5. 运维管理

### 5.1 监控管理
1. 状态检查
```bash
# 检查节点状态
calicoctl node status

# 检查BGP peer
calicoctl get bgpPeer

# 检查IP池
calicoctl get ippool -o wide
```

2. 日志收集
```bash
# Felix日志
kubectl logs -n calico-system calico-node-xxxxx -c calico-node

# BGP日志
kubectl logs -n calico-system calico-node-xxxxx -c calico-node | grep "bird"
```

### 5.2 故障排查
1. 连通性问题
```bash
# 检查Pod网络
calicoctl get workloadEndpoint -o wide

# 检查路由
ip route

# 检查iptables规则
iptables-save | grep CALICO
```

2. 策略问题
```bash
# 检查策略状态
calicoctl get networkpolicy

# 调试策略
calicoctl get networkpolicy -o yaml > policy.yaml
```

## 6. 性能优化

### 6.1 网络优化
1. MTU配置
```yaml
apiVersion: operator.tigera.io/v1
kind: Installation
spec:
  calicoNetwork:
    mtu: 1440
```

2. 性能参数
```bash
# 调整Felix参数
calicoctl patch felixconfiguration default --patch '{"spec":{"ipipMTU": 1440}}'
```

### 6.2 资源优化
1. 资源限制
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: calico-node
spec:
  template:
    spec:
      containers:
      - name: calico-node
        resources:
          requests:
            cpu: 250m
            memory: 64Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

2. 内核参数
```bash
# 网络参数优化
sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv4.conf.all.rp_filter=0
sysctl -w net.ipv4.conf.default.rp_filter=0
``` 