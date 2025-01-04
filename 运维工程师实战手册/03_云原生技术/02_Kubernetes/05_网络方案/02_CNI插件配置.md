# Kubernetes CNI插件配置

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
- 网络工程师
- DevOps工程师
- 平台运维人员

### 前置知识
- Kubernetes网络基础
- Linux网络配置
- 容器网络基础
- CNI规范了解

## CNI概述
### 基本概念
1. 定义
   - 容器网络接口标准
   - 插件化网络方案
   - 统一接口规范
   - 可扩展架构

2. 功能
   - 网络配置
   - IP地址管理
   - 路由管理
   - 网络策略

3. 特性
   - 标准化接口
   - 插件化设计
   - 动态配置
   - 多插件支持

## 常用CNI插件
### Calico
1. 特点
   - BGP路由协议
   - 高性能数据平面
   - 完整网络策略
   - 跨子网通信

2. 安装配置
```yaml
# 安装Calico
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: calico-node
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: calico-node
  template:
    metadata:
      labels:
        k8s-app: calico-node
    spec:
      containers:
      - name: calico-node
        image: calico/node:v3.25.0
        env:
        - name: DATASTORE_TYPE
          value: "kubernetes"
        - name: CALICO_IPV4POOL_CIDR
          value: "192.168.0.0/16"
        - name: CALICO_IPV4POOL_IPIP
          value: "Always"
```

3. 网络配置
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

### Flannel
1. 特点
   - 简单易用
   - Overlay网络
   - VXLAN支持
   - 跨主机通信

2. 安装配置
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: kube-flannel-ds
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: flannel
  template:
    metadata:
      labels:
        app: flannel
    spec:
      containers:
      - name: kube-flannel
        image: flannel/flannel:v0.20.0
        args:
        - --ip-masq
        - --kube-subnet-mgr
```

3. 网络配置
```json
{
  "Network": "10.244.0.0/16",
  "Backend": {
    "Type": "vxlan"
  }
}
```

### Cilium
1. 特点
   - eBPF技术
   - 高性能
   - 安全策略
   - 可观测性

2. 安装配置
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: cilium
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: cilium
  template:
    metadata:
      labels:
        k8s-app: cilium
    spec:
      containers:
      - name: cilium-agent
        image: cilium/cilium:v1.12.0
```

3. 网络配置
```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: cilium-network-policy
spec:
  endpointSelector:
    matchLabels:
      app: myapp
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend
```

## 配置管理
### 基础配置
1. CNI配置文件
```json
{
  "cniVersion": "0.3.1",
  "name": "k8s-pod-network",
  "plugins": [
    {
      "type": "calico",
      "ipam": {
        "type": "calico-ipam"
      },
      "policy": {
        "type": "k8s"
      },
      "kubernetes": {
        "kubeconfig": "/etc/cni/net.d/calico-kubeconfig"
      }
    }
  ]
}
```

2. IPAM配置
```json
{
  "ipam": {
    "type": "host-local",
    "ranges": [
      [
        {
          "subnet": "10.244.0.0/16",
          "rangeStart": "10.244.1.20",
          "rangeEnd": "10.244.1.50"
        }
      ]
    ]
  }
}
```

### 高级配置
1. 多网络接口
```yaml
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: macvlan-conf
spec:
  config: '{
    "cniVersion": "0.3.1",
    "type": "macvlan",
    "master": "eth0",
    "mode": "bridge",
    "ipam": {
      "type": "host-local",
      "subnet": "192.168.1.0/24",
      "rangeStart": "192.168.1.200",
      "rangeEnd": "192.168.1.216"
    }
  }'
```

2. 带宽限制
```json
{
  "type": "bandwidth",
  "capabilities": {"bandwidth": true},
  "ingressRate": 1000000,
  "ingressBurst": 1000000,
  "egressRate": 1000000,
  "egressBurst": 1000000
}
```

## 性能优化
### 网络性能
1. MTU优化
```yaml
apiVersion: projectcalico.org/v3
kind: FelixConfiguration
metadata:
  name: default
spec:
  mtu: 9000
```

2. IPIP模式
```yaml
apiVersion: projectcalico.org/v3
kind: IPPool
metadata:
  name: ippool-ipip-1
spec:
  cidr: 192.168.0.0/16
  ipipMode: CrossSubnet
  natOutgoing: true
```

3. Direct Routing
```yaml
apiVersion: projectcalico.org/v3
kind: IPPool
metadata:
  name: ippool-1
spec:
  cidr: 192.168.0.0/16
  ipipMode: Never
  natOutgoing: true
```

### 监控配置
1. Prometheus监控
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: cni-metrics
  namespace: monitoring
spec:
  selector:
    matchLabels:
      k8s-app: calico-node
  endpoints:
  - port: metrics
```

2. 日志配置
```yaml
apiVersion: projectcalico.org/v3
kind: FelixConfiguration
metadata:
  name: default
spec:
  logSeverityScreen: Info
```

## 故障排查
### 常见问题
1. 网络连通性
   - Pod无法通信
   - Service访问失败
   - DNS解析问题
   - 跨节点通信失败

2. IP地址问题
   - IP地址冲突
   - IP地址耗尽
   - IPAM配置错误
   - 子网配置错误

3. CNI插件问题
   - 插件安装失败
   - 配置文件错误
   - 版本不兼容
   - 资源限制问题

### 排查命令
```bash
# 检查CNI插件状态
kubectl get pods -n kube-system | grep cni
kubectl describe pod <cni-pod> -n kube-system

# 检查CNI配置
ls /etc/cni/net.d/
cat /etc/cni/net.d/10-calico.conflist

# 检查网络连通性
kubectl exec -it <pod-name> -- ping <target-ip>
kubectl exec -it <pod-name> -- traceroute <target-ip>

# 检查CNI日志
kubectl logs <cni-pod> -n kube-system
journalctl -u kubelet | grep cni
```

## 安全配置
### 网络策略
1. 基本策略
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

2. 加密通信
```yaml
apiVersion: projectcalico.org/v3
kind: IPPool
metadata:
  name: ippool-1
spec:
  cidr: 192.168.0.0/16
  ipipMode: Always
  natOutgoing: true
  encryption: WireGuard
```

### 访问控制
1. RBAC配置
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: cni-admin
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

2. 安全上下文
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    image: nginx
```

## 升级维护
### 版本升级
1. 升级步骤
   - 备份配置
   - 更新镜像
   - 滚动升级
   - 验证功能

2. 配置迁移
   - 导出配置
   - 调整参数
   - 导入配置
   - 验证生效

### 备份恢复
1. 配置备份
```bash
# 备份CNI配置
cp -r /etc/cni/net.d/ /backup/cni/
kubectl get networkpolicy -A -o yaml > /backup/networkpolicy.yaml

# 备份证书
cp -r /etc/kubernetes/pki/ /backup/pki/
```

2. 状态恢复
```bash
# 恢复CNI配置
cp -r /backup/cni/ /etc/cni/net.d/
kubectl apply -f /backup/networkpolicy.yaml

# 恢复证书
cp -r /backup/pki/ /etc/kubernetes/
```

## 参考资料
- [CNI规范](https://github.com/containernetworking/cni)
- [Calico文档](https://docs.projectcalico.org/)
- [Flannel文档](https://github.com/flannel-io/flannel)
- [Cilium文档](https://docs.cilium.io/)

## 相关文档
- [网络基础概念](./01_网络基础概念.md)
- [Service服务](./03_Service服务.md)
- [网络策略](./05_网络策略.md)
``` 