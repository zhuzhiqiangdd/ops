# Flannel网络组件

## 1. 基本概念

### 1.1 什么是Flannel
Flannel是一个专为Kubernetes设计的简单、易用的网络插件，它提供了一个基于Layer 3的网络解决方案。主要特点：
- 简单易用
- 多后端支持
- 跨主机通信
- 自动配置

### 1.2 核心功能
1. 网络功能
   - 网络配置
   - IP分配
   - 跨主机通信
   - 网络隔离

2. 后端支持
   - VXLAN
   - Host-GW
   - UDP
   - IPSec

## 2. 架构设计

### 2.1 核心组件
1. flanneld
   - 网络配置
   - 路由管理
   - 子网分配
   - 后端实现

2. CNI插件
   - 接口配置
   - IP地址管理
   - 路由设置
   - 网络连接

### 2.2 工作原理
1. 网络模型
```
Pod -> Container Network -> Flannel Network -> Host Network
```

2. 数据流向
```
Pod1 -> veth -> bridge -> flanneld -> Host Network -> flanneld -> bridge -> veth -> Pod2
```

## 3. 部署配置

### 3.1 安装部署
1. 基础配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-flannel-cfg
  namespace: kube-system
data:
  net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "Backend": {
        "Type": "vxlan"
      }
    }
```

2. DaemonSet部署
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
        image: quay.io/coreos/flannel:v0.14.0
        command:
        - /opt/bin/flanneld
        args:
        - --ip-masq
        - --kube-subnet-mgr
```

### 3.2 网络配置
1. VXLAN配置
```json
{
  "Network": "10.244.0.0/16",
  "Backend": {
    "Type": "vxlan",
    "VNI": 1,
    "Port": 8472,
    "DirectRouting": true
  }
}
```

2. Host-GW配置
```json
{
  "Network": "10.244.0.0/16",
  "Backend": {
    "Type": "host-gw"
  }
}
```

## 4. 网络管理

### 4.1 子网管理
1. 查看子网分配
```bash
# 查看子网信息
kubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}'

# 查看Flannel配置
kubectl get configmap kube-flannel-cfg -n kube-system -o yaml
```

2. 子网配置
```bash
# 修改子网范围
kubectl edit configmap kube-flannel-cfg -n kube-system

# 重启Flannel
kubectl delete pod -l app=flannel -n kube-system
```

### 4.2 路由管理
1. 查看路由
```bash
# 查看主机路由
ip route

# 查看VXLAN接口
ip -d link show flannel.1
```

2. 路由调试
```bash
# 检查连通性
ping <pod-ip>

# 跟踪路由
traceroute <pod-ip>
```

## 5. 运维管理

### 5.1 监控管理
1. 状态监控
```bash
# 查看Pod状态
kubectl get pods -n kube-system -l app=flannel

# 查看日志
kubectl logs -n kube-system -l app=flannel
```

2. 网络监控
```bash
# 查看网络接口
ip addr show flannel.1

# 监控网络流量
tcpdump -i flannel.1
```

### 5.2 故障排查
1. 常见问题
   - 网络不通
   - Pod无法获取IP
   - 跨节点通信失败
   - MTU配置错误

2. 排查方法
```bash
# 检查Flannel状态
kubectl get pods -n kube-system | grep flannel

# 检查配置
kubectl describe configmap kube-flannel-cfg -n kube-system

# 检查日志
kubectl logs -n kube-system <flannel-pod-name>
```

## 6. 性能优化

### 6.1 网络优化
1. MTU优化
```json
{
  "Network": "10.244.0.0/16",
  "Backend": {
    "Type": "vxlan",
    "VNI": 1,
    "MTU": 1450
  }
}
```

2. 后端选择
- VXLAN: 通用性好
- Host-GW: 性能最佳
- UDP: 调试使用
- IPSec: 安全性高

### 6.2 资源优化
1. 资源限制
```yaml
resources:
  requests:
    cpu: 100m
    memory: 50Mi
  limits:
    cpu: 200m
    memory: 100Mi
```

2. 内核参数
```bash
# 网络参数优化
sysctl -w net.ipv4.ip_forward=1
sysctl -w net.bridge.bridge-nf-call-iptables=1
```

## 7. 最佳实践

### 7.1 部署建议
1. 网络规划
   - 合理规划网段
   - 预留足够地址
   - 考虑扩展性
   - 避免地址冲突

2. 高可用配置
   - 多副本部署
   - 资源限制
   - 健康检查
   - 自动恢复

### 7.2 安全建议
1. 网络隔离
   - 使用网络策略
   - 限制访问范围
   - 启用IPSec
   - 监控异常流量

2. 配置安全
   - 最小权限原则
   - 定期更新版本
   - 加密敏感信息
   - 审计日志记录 